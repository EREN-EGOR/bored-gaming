import asyncio
import time
import json
import httpx
from playwright.async_api import async_playwright

PROXY_URL = "http://127.0.0.1:8765/v1/messages"  # 本地代理完整地址
API_KEY = "xtalpi-horologium-51d66e43-60a6-464f-ba5b-5f8c5890c7ba"
MODEL_NAME = "rl_d8f3uat5tb1000cjp03g"

game_url = "http://localhost:8000/save_the_load.html"

async def call_claude_via_proxy(prompt_text, max_retries=4):
    """
    原生 HTTP POST 请求，含指数退避重试以应对 429 速率限制。
    """
    headers = {
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
    }

    payload = {
        "model": MODEL_NAME,
        "max_tokens": 800,  # 给足token让模型思考，最后一行提取指令
        "messages": [
            {"role": "user", "content": prompt_text}
        ]
    }

    for attempt in range(max_retries):
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(PROXY_URL, headers=headers, json=payload)
            if resp.status_code == 200:
                result_json = resp.json()
                try:
                    return result_json["content"][0]["text"]
                except (KeyError, IndexError):
                    if "text" in result_json:
                        return result_json["text"]
                    return str(result_json)
            elif resp.status_code == 429:
                # 指数退避：15s → 30s → 60s → 120s
                wait_sec = 15 * (2 ** attempt)
                print(f"⏳ 触发速率限制，等待 {wait_sec} 秒后重试 (第 {attempt+1}/{max_retries} 次)...")
                await asyncio.sleep(wait_sec)
            else:
                raise Exception(f"代理返回错误码: {resp.status_code}, 详情: {resp.text}")

    raise Exception(f"已重试 {max_retries} 次仍触发速率限制，本步跳过")


async def reset_game(page):
    """清除游戏存档并刷新页面，让 AI 从头开始新一局。"""
    print("🔄 清除游戏存档，重新开始新一局...")
    await page.evaluate("""() => {
        try { sessionStorage.removeItem('save_the_load_quick'); } catch(e) {}
        try { localStorage.removeItem('save_the_load_quick'); } catch(e) {}
        try { localStorage.removeItem('save_the_load_slot1'); } catch(e) {}
    }""")
    await page.reload()
    await asyncio.sleep(4)

async def play_loop():
    async with async_playwright() as p:
        print("🌐 正在通过原生 Playwright 调起本地 Edge 浏览器...")
        browser = await p.chromium.launch(
            headless=False,
            executable_path=r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
        )
        context = await browser.new_context()
        page = await context.new_page()

        print(f"🔗 正在导航到 game 网址: {game_url}")
        await page.goto(game_url)
        await asyncio.sleep(4)

        print("🚀 正式开启玩游戏循环...")

        step = 0
        turn_history = []   # 本战斗轮次内已打出的牌，换轮/换战斗时清空
        last_energy = None  # 上一步的能量，能量恢复说明新回合开始

        while step < 60:
            step += 1
            print(f"\n📍 正在进行第 {step} 步操作评估...")

            try:
                await asyncio.sleep(1.5)

                # ── 1. 抓取页面状态 ──────────────────────────────────────────
                elements_info = await page.evaluate("""() => {
                    let items = [];
                    let activeScreen = document.querySelector('.screen.active');
                    let screenId = activeScreen ? activeScreen.id : 'unknown';

                    // 弹窗
                    let overlay = document.getElementById('overlay');
                    if (overlay && overlay.classList.contains('show')) {
                        let modal = document.getElementById('modal');
                        let title = modal && modal.querySelector('h2') ? modal.querySelector('h2').innerText.trim() : '';
                        items.push(`[overlay] 弹窗: "${title}" — 必须先处理！`);
                        modal && modal.querySelectorAll('button').forEach((el, i) => {
                            if (!el.disabled) items.push(`[btn:m${i}] 弹窗按钮 "${el.innerText.trim()}"`);
                        });
                    }

                    // 标题页角色卡
                    document.querySelectorAll('.char-card').forEach(el => {
                        if (el.getBoundingClientRect().width > 0) {
                            let name = el.querySelector('h3') ? el.querySelector('h3').innerText.trim() : el.id;
                            items.push(`[char:${el.id}] 角色 "${name}"`);
                        }
                    });

                    // 地图可达节点
                    document.querySelectorAll('.node.reachable').forEach((el, i) => {
                        let label = el.querySelector('.label') ? el.querySelector('.label').innerText.trim() : '';
                        let icon  = el.innerText.replace(label, '').trim();
                        items.push(`[node:${i}] ${icon} ${label}`);
                    });

                    // ── 战斗信息 ────────────────────────────────────────────
                    // 能量
                    let energyEl = document.getElementById('energy');
                    let energy = energyEl ? parseInt(energyEl.innerText) : 0;
                    if (energyEl) items.push(`[info] 能量: ${energyEl.innerText}`);

                    // 玩家 HP / 格挡（从 .actor.player 读）
                    let playerActor = document.querySelector('.actor.player, #player-actor');
                    if (playerActor) {
                        let hpSpan = playerActor.querySelector('.bar.hp span, span');
                        let blkBadge = playerActor.querySelector('.block-badge');
                        if (hpSpan) items.push(`[info] 我方HP: ${hpSpan.innerText.trim()}`);
                        if (blkBadge) items.push(`[info] 我方格挡: ${blkBadge.innerText.replace('🛡','').trim()}`);
                    }

                    // 敌人（从 .actor.enemy 读，DOM 真实结构）
                    document.querySelectorAll('.actor.enemy').forEach((el, i) => {
                        let name   = el.querySelector('.actor-name') ? el.querySelector('.actor-name').innerText.trim() : `敌人${i}`;
                        let intent = el.querySelector('.intent')     ? el.querySelector('.intent').innerText.trim()     : '?';
                        let hpText = el.querySelector('.bar.hp span') ? el.querySelector('.bar.hp span').innerText.trim() : '';
                        let blk    = el.querySelector('.block-badge') ? el.querySelector('.block-badge').innerText.replace('🛡','').trim() : '0';
                        // 状态（虚弱/易伤等）
                        let statuses = [...el.querySelectorAll('.status')].map(s => s.innerText.trim()).join(' ');
                        items.push(`[enemy:${i}] ${name} HP:${hpText} 格挡:${blk} 意图:${intent}${statuses ? ' 状态:'+statuses : ''}`);
                    });

                    // 手牌（只列可打的，编号与代码点击完全对齐）
                    let playableIdx = 0;
                    document.querySelectorAll('#hand .card').forEach(el => {
                        let cost  = el.querySelector('.cost')  ? el.querySelector('.cost').innerText.trim()  : '?';
                        let name  = el.querySelector('.cname') ? el.querySelector('.cname').innerText.trim() : '?';
                        let ctype = el.querySelector('.ctype') ? el.querySelector('.ctype').innerText.trim() : '';
                        let desc  = el.querySelector('.cdesc') ? el.querySelector('.cdesc').innerText.trim().replace(/\\n/g,' ').slice(0,80) : '';
                        if (!el.classList.contains('unplayable')) {
                            items.push(`[card:${playableIdx}] 费用${cost} ${ctype}「${name}」${desc}`);
                            playableIdx++;
                        }
                    });
                    let totalCards = document.querySelectorAll('#hand .card').length;
                    if (totalCards > 0 && playableIdx === 0)
                        items.push(`[card:NONE] 所有手牌费用不足，能量不够出牌`);

                    // 普通按钮
                    document.querySelectorAll('button').forEach((el, i) => {
                        let rect = el.getBoundingClientRect();
                        let text = el.innerText.trim();
                        if (rect.width > 0 && !el.disabled && text !== '玩法说明')
                            items.push(`[btn:${i}] "${text}"`);
                    });

                    return JSON.stringify({ screenId, energy, items });
                }""")

                state = json.loads(elements_info)
                screen_id   = state['screenId']
                cur_energy  = state['energy']
                items_text  = '\n'.join(state['items'])

                # 新回合检测：能量恢复（从低到高）说明回合切换，清空本轮出牌记录
                if last_energy is not None and cur_energy > last_energy:
                    turn_history.clear()
                    print(f"🔄 新回合，能量从{last_energy}→{cur_energy}，出牌记录已清空")
                # 离开战斗也清空
                if screen_id != 'screen-combat':
                    turn_history.clear()
                last_energy = cur_energy

                history_text = ''
                if turn_history:
                    history_text = f"\n本回合已出牌（不要重复）: {' → '.join(turn_history)}\n"

                # ── 2. 构建 Prompt ────────────────────────────────────────────
                prompt = f"""你是卡牌Roguelike高手，正在玩「Save the Load」。

当前状态（页面: {screen_id}）：
{items_text[:1800]}
{history_text}
请分析局面（2-3句），然后给出最优操作。

指令格式（最后一行只写一条指令）：
[CLICK_CHAR] pick-loader/pick-clerk/pick-doubao/pick-tianhou  ← 标题页选角色
[CLICK_NODE] N        ← 地图页走节点
[CLICK_CARD] N        ← 战斗出牌（N=上方[card:N]编号，每次打一张）
[CLICK_BTN] "文字"    ← 点按钮（弹窗/结束回合等）

战斗要点：
· 有[overlay]弹窗必须先处理
· [card:NONE]或能量=0才结束回合，否则继续出牌
· 敌人意图含⚔数字=攻击伤害，先出格挡牌抵消；不攻击时全力输出
· 本回合已出的牌不要重复出（看"已出牌"记录）"""

                # ── 3. 调用模型 ───────────────────────────────────────────────
                reply = await call_claude_via_proxy(prompt)
                reply = reply.strip()
                print(f"🤖 {reply}")

                last_line = reply.split('\n')[-1].strip()

                # ── 4. 执行动作 ───────────────────────────────────────────────
                if "[CLICK_CHAR]" in last_line:
                    char_id = last_line.split("[CLICK_CHAR]")[-1].strip()
                    print(f"🎯 选角色 #{char_id}")
                    await page.click(f"#{char_id}", timeout=3000)

                elif "[CLICK_NODE]" in last_line:
                    try:
                        node_idx = int(last_line.split("[CLICK_NODE]")[-1].strip())
                    except ValueError:
                        node_idx = 0
                    print(f"🎯 走节点 index={node_idx}")
                    # 先关弹窗再点节点
                    overlay_open = await page.evaluate("document.getElementById('overlay')?.classList.contains('show') || false")
                    if overlay_open:
                        for sel in ["#m-close", "#m-leave", "#m-skip", "text=关闭", "text=离开", "text=不拿"]:
                            try:
                                await page.click(sel, timeout=800)
                                break
                            except Exception:
                                pass
                        else:
                            await page.evaluate("document.getElementById('overlay').classList.remove('show')")
                        await asyncio.sleep(1)
                    nodes = await page.query_selector_all(".node.reachable")
                    if nodes:
                        target = nodes[node_idx] if node_idx < len(nodes) else nodes[0]
                        await target.click(timeout=5000)
                    else:
                        print("⚠️ 没有可达节点")

                elif "[CLICK_CARD]" in last_line:
                    try:
                        card_idx = int(last_line.split("[CLICK_CARD]")[-1].strip())
                    except ValueError:
                        card_idx = 0
                    cards = await page.query_selector_all("#hand .card:not(.unplayable)")
                    if cards:
                        target = cards[card_idx] if card_idx < len(cards) else cards[0]
                        card_name = await target.eval_on_selector(".cname", "el => el.innerText") if await target.query_selector(".cname") else "?"
                        print(f"🎯 打出「{card_name}」(index={card_idx}, 共{len(cards)}张可打)")
                        await target.click()
                        turn_history.append(card_name)  # 记录本轮已出牌
                        await asyncio.sleep(0.6)
                        # 需要选目标时自动点第一个敌人
                        hint = await page.query_selector("#target-hint.show")
                        if hint:
                            enemies = await page.query_selector_all(".actor.enemy")
                            if enemies:
                                await enemies[0].click()
                    else:
                        print("⚠️ 无可打牌，结束回合")
                        await page.click("#btn-end-turn", timeout=3000)
                        turn_history.clear()

                elif "[CLICK_BTN]" in last_line:
                    btn_text = last_line.split("[CLICK_BTN]")[-1].strip().strip('"')
                    print(f"🎯 点击按钮「{btn_text}」")
                    await page.click(f"text={btn_text}", timeout=3000)
                    if "结束回合" in btn_text:
                        turn_history.clear()

                else:
                    print("⚠️ 格式未识别，执行保底操作...")
                    if screen_id == "screen-title":
                        await page.click(".char-card", timeout=3000)
                    else:
                        await page.click("button:not([disabled])", timeout=3000)

            except Exception as e:
                err_str = str(e)
                print(f"❌ 异常: {err_str}")
                if "速率限制" in err_str:
                    await reset_game(page)
                    step = 0
                    turn_history.clear()
                    last_energy = None

            await asyncio.sleep(6)

if __name__ == "__main__":
    asyncio.run(play_loop())
