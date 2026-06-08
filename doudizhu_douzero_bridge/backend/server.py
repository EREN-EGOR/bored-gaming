"""
DouZero bridge server for the HTML Dou Dizhu frontend.

Run:
    python backend/server.py

The frontend sends the initial deal + action history. This server replays the game
inside DouZero's official GameEnv and asks the pretrained DeepAgent for the next AI move.
"""
from __future__ import annotations

import os
from pathlib import Path
from typing import Any, Dict, List

from flask import Flask, jsonify, request
from flask_cors import CORS

try:
    from douzero.env.game import GameEnv
    from douzero.evaluation.deep_agent import DeepAgent
except Exception as exc:  # pragma: no cover
    GameEnv = None
    DeepAgent = None
    IMPORT_ERROR = exc
else:
    IMPORT_ERROR = None


APP_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_MODEL_DIR = APP_ROOT / "models" / "douzero_ADP"
MODEL_DIR = Path(os.environ.get("DOUZERO_MODEL_DIR", str(DEFAULT_MODEL_DIR))).resolve()
HOST = os.environ.get("DOUZERO_HOST", "127.0.0.1")
PORT = int(os.environ.get("DOUZERO_PORT", "8765"))

RANK_TO_ENV = {
    "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "10": 10,
    "J": 11, "Q": 12, "K": 13, "A": 14, "2": 17,
    "X": 20, "小王": 20, "x": 20,
    "D": 30, "大王": 30, "d": 30,
}
ENV_TO_FRONTEND = {
    3: "3", 4: "4", 5: "5", 6: "6", 7: "7", 8: "8", 9: "9", 10: "10",
    11: "J", 12: "Q", 13: "K", 14: "A", 17: "2", 20: "X", 30: "D",
}
POSITIONS = ["landlord", "landlord_down", "landlord_up"]


def to_env_cards(cards: List[Any]) -> List[int]:
    result = []
    for card in cards:
        key = str(card)
        if key not in RANK_TO_ENV:
            raise ValueError(f"未知牌面：{card!r}")
        result.append(RANK_TO_ENV[key])
    result.sort()
    return result


def to_frontend_cards(cards: List[int]) -> List[str]:
    return [ENV_TO_FRONTEND[int(card)] for card in cards]


def index_to_position_map(landlord_index: int) -> Dict[int, str]:
    # DouZero's playing order is landlord -> landlord_down -> landlord_up -> landlord.
    return {
        landlord_index: "landlord",
        (landlord_index + 1) % 3: "landlord_down",
        (landlord_index + 2) % 3: "landlord_up",
    }


class ReplayAgent:
    def __init__(self) -> None:
        self.action: List[int] = []

    def set_action(self, action: List[int]) -> None:
        self.action = list(action)

    def act(self, infoset):
        # Let DouZero's own engine validate the move.
        if self.action not in infoset.legal_actions:
            raise ValueError(
                f"历史动作不符合 DouZero 合法动作。action={self.action}, "
                f"legal_actions_count={len(infoset.legal_actions)}"
            )
        return self.action


class DouZeroService:
    def __init__(self, model_dir: Path) -> None:
        self.model_dir = model_dir
        self.agents = None

    def _model_paths(self) -> Dict[str, Path]:
        return {
            "landlord": self.model_dir / "landlord.ckpt",
            "landlord_down": self.model_dir / "landlord_down.ckpt",
            "landlord_up": self.model_dir / "landlord_up.ckpt",
        }

    def load(self) -> None:
        if IMPORT_ERROR is not None:
            raise RuntimeError(f"导入 DouZero 失败：{IMPORT_ERROR}")
        paths = self._model_paths()
        missing = [str(path) for path in paths.values() if not path.exists()]
        if missing:
            raise FileNotFoundError(
                "找不到 DouZero 预训练模型：\n" + "\n".join(missing) +
                "\n请把官方 baselines/douzero_ADP 下的 landlord.ckpt、landlord_up.ckpt、landlord_down.ckpt 放到这里。"
            )
        self.agents = {pos: DeepAgent(pos, str(path)) for pos, path in paths.items()}

    def ensure_loaded(self) -> None:
        if self.agents is None:
            self.load()

    def act(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        self.ensure_loaded()
        landlord_index = int(payload["landlord"])
        ai_index = int(payload["aiPlayer"])
        initial_hands = payload["initialHands"]
        bottom = payload.get("bottom", [])
        history = payload.get("history", [])

        index_pos = index_to_position_map(landlord_index)
        pos_index = {v: k for k, v in index_pos.items()}
        ai_position = index_pos[ai_index]

        players = {pos: ReplayAgent() for pos in POSITIONS}
        env = GameEnv(players)
        card_play_data = {
            pos: to_env_cards(initial_hands[idx])
            for idx, pos in index_pos.items()
        }
        card_play_data["three_landlord_cards"] = to_env_cards(bottom)
        env.card_play_init(card_play_data)

        for step, item in enumerate(history):
            player_index = int(item["player"])
            expected_position = index_pos[player_index]
            if env.acting_player_position != expected_position:
                raise ValueError(
                    f"历史第 {step + 1} 步轮次不一致：前端说 {expected_position}，"
                    f"但 DouZero 当前轮到 {env.acting_player_position}。"
                )
            action = to_env_cards(item.get("cards", []))
            players[expected_position].set_action(action)
            env.step()
            if env.game_over:
                break

        if env.game_over:
            return {"action": [], "position": ai_position, "game_over": True}
        if env.acting_player_position != ai_position:
            raise ValueError(
                f"当前行动玩家不一致：前端请求 {ai_position}，但 DouZero 当前轮到 {env.acting_player_position}。"
            )

        action = self.agents[ai_position].act(env.game_infoset)
        return {
            "action": to_frontend_cards(action),
            "env_action": action,
            "position": ai_position,
            "legal_actions_count": len(env.game_infoset.legal_actions),
            "num_cards_left": env.game_infoset.num_cards_left_dict,
        }


app = Flask(__name__)
CORS(app)
service = DouZeroService(MODEL_DIR)


@app.get("/health")
def health():
    status = {
        "ok": True,
        "model_dir": str(MODEL_DIR),
        "douzero_imported": IMPORT_ERROR is None,
        "models_exist": {k: v.exists() for k, v in service._model_paths().items()},
    }
    return jsonify(status)


@app.post("/act")
def act():
    try:
        payload = request.get_json(force=True)
        result = service.act(payload)
        result["ok"] = True
        return jsonify(result)
    except Exception as exc:
        return jsonify({"ok": False, "error": str(exc)}), 500


if __name__ == "__main__":
    print(f"DouZero bridge server: http://{HOST}:{PORT}")
    print(f"Model dir: {MODEL_DIR}")
    app.run(host=HOST, port=PORT, debug=False)
