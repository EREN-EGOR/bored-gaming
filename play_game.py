import asyncio
import time
import httpx  # 保持纯正的原生 httpx 发送请求，绝不经过 langchain 的内存拦截
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
    # 使用官方原生 Playwright 调起 Edge
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
        await asyncio.sleep(4) # 给本地游戏留出充足的初次渲染时间
        
        print("🚀 正式开启玩游戏循环...")

        step = 0
        while step < 30:
            step += 1
            print(f"\n📍 正在进行第 {step} 步操作评估...")

            try:
                # 0. 等待页面稳定（无加载动画/过渡中的 overlay）
                await asyncio.sleep(1.5)

                # 1. 提取当前页面状态和可点击元素
                elements_info = await page.evaluate("""() => {
                    let items = [];
                    let activeScreen = document.querySelector('.screen.active');
                    let screenId = activeScreen ? activeScreen.id : 'unknown';

                    // 弹窗（overlay）内容：有弹窗时优先处理
                    let overlay = document.getElementById('overlay');
                    if (overlay && overlay.classList.contains('show')) {
                        let modal = document.getElementById('modal');
                        let title = modal && modal.querySelector('h2') ? modal.querySelector('h2').innerText.trim() : '';
                        items.push(`[overlay] 当前弹窗: "${title}" (必须先处理弹窗！)`);
                        modal && modal.querySelectorAll('button').forEach((el, index) => {
                            if (!el.disabled) items.push(`[btn:overlay${index}] 弹窗按钮 "${el.innerText.trim()}"`);
                        });
                    }
                    // 收集人物卡片（标题页选角色）
                    document.querySelectorAll('.char-card').forEach((el) => {
                        let rect = el.getBoundingClientRect();
                        if (rect.width > 0 && rect.height > 0) {
                            let name = el.querySelector('h3') ? el.querySelector('h3').innerText.trim() : el.id;
                            items.push(`[char:${el.id}] 人物卡片 "${name}"`);
                        }
                    });
                    // 只收集 reachable 节点（真正可点的），按数组顺序给编号
                    document.querySelectorAll('.node.reachable').forEach((el, index) => {
                        let label = el.querySelector('.label') ? el.querySelector('.label').innerText.trim() : '';
                        let icon = el.innerText.replace(label, '').trim();
                        items.push(`[node:${index}] 可达节点 "${icon} ${label}"`);
                    });
                    // 战斗页：只列可打的手牌（费用够的），编号和代码点击完全对齐
                    let playableIdx = 0;
                    document.querySelectorAll('#hand .card').forEach((el) => {
                        let cost = el.querySelector('.cost') ? el.querySelector('.cost').innerText.trim() : '?';
                        let name = el.querySelector('.cname') ? el.querySelector('.cname').innerText.trim() : '未知';
                        let desc = el.querySelector('.cdesc') ? el.querySelector('.cdesc').innerText.trim().replace(/\\n/g,' ').slice(0,60) : '';
                        let ctype = el.querySelector('.ctype') ? el.querySelector('.ctype').innerText.trim() : '';
                        if (!el.classList.contains('unplayable')) {
                            items.push(`[card:${playableIdx}] 费用${cost} ${ctype}「${name}」- ${desc}`);
                            playableIdx++;
                        }
                    });
                    if (playableIdx === 0 && document.querySelectorAll('#hand .card').length > 0) {
                        items.push(`[card:NONE] 手牌全部费用不足，无法出牌，请结束回合`);
                    }
                    // 战斗状态：当前能量、玩家血量/格挡、敌人状态
                    let energyEl = document.getElementById('energy');
                    if (energyEl) items.push(`[info] 当前能量: ${energyEl.innerText}`);
                    document.querySelectorAll('.enemy-box').forEach((el, i) => {
                        let hp = el.querySelector('.ehp-text') ? el.querySelector('.ehp-text').innerText.trim() : '';
                        let intent = el.querySelector('.intent-label') ? el.querySelector('.intent-label').innerText.trim() : '';
                        items.push(`[info] 敌人${i}: HP=${hp} 意图=${intent}`);
                    });
                    let playerHp = document.getElementById('player-hp-text');
                    let playerBlock = document.getElementById('player-block');
                    if (playerHp) items.push(`[info] 我方HP: ${playerHp.innerText}`);
                    if (playerBlock) items.push(`[info] 我方格挡: ${playerBlock.innerText}`);
                    // 收集普通按钮（排除玩法说明）
                    document.querySelectorAll('button').forEach((el, index) => {
                        let rect = el.getBoundingClientRect();
                        let text = el.innerText.trim();
                        if (rect.width > 0 && rect.height > 0 && !el.disabled && text !== '玩法说明') {
                            items.push(`[btn:${index}] 按钮 "${text}"`);
                        }
                    });
                    return `当前页面: ${screenId}\\n可交互元素:\\n` + (items.length > 0 ? items.join('\\n') : '无元素');
                }""")

                # 2. 构建 Prompt — 允许推理，最后一行必须是指令
                prompt = f"""你是卡牌Roguelike游戏高手。当前游戏状态：
{elements_info[:1500]}

请先简短分析局面（2-3句），再给出最优操作。

操作指令格式（最后一行必须是以下之一）：
- 选角色：[CLICK_CHAR] pick-loader / pick-clerk / pick-doubao / pick-tianhou
- 走地图：[CLICK_NODE] 编号
- 打手牌：[CLICK_CARD] N  （N是上方[card:N]的编号，每次只打一张）
- 点按钮：[CLICK_BTN] "按钮文字"

战斗决策要点：
- 优先攻击牌打伤害，敌人意图是攻击时考虑格挡
- 有[overlay]弹窗必须先处理
- [card:NONE]或能量耗尽才结束回合

最后一行只写指令，不加其他文字。"""

                # 3. 发起原生 HTTP 请求
                reply = await call_claude_via_proxy(prompt)
                reply = reply.strip()
                print(f"🤖 大模型策略思考结果:\n{reply}")

                # 4. 解析并执行点击
                last_line = reply.split('\n')[-1].strip()

                if "[CLICK_CHAR]" in last_line:
                    char_id = last_line.split("[CLICK_CHAR]")[-1].strip()
                    print(f"🎯 点击人物卡片: #{char_id}")
                    await page.click(f"#{char_id}", timeout=3000)

                elif "[CLICK_NODE]" in last_line:
                    try:
                        node_idx = int(last_line.split("[CLICK_NODE]")[-1].strip())
                    except ValueError:
                        node_idx = 0
                    print(f"🎯 点击地图节点 index={node_idx}")
                    # 先检查是否有弹窗遮挡，有则关闭
                    overlay_open = await page.evaluate("document.getElementById('overlay')?.classList.contains('show') || false")
                    if overlay_open:
                        print("⚠️ 检测到弹窗遮挡，尝试关闭...")
                        # 按优先级依次尝试关闭弹窗：关闭按钮 → 离开按钮 → 点 overlay 背景
                        closed = False
                        for close_sel in ["#m-close", "#m-leave", "#m-skip", "text=关闭", "text=离开", "text=不拿", "text=确认"]:
                            try:
                                await page.click(close_sel, timeout=800)
                                closed = True
                                break
                            except Exception:
                                pass
                        if not closed:
                            # 最后手段：点弹窗背景关闭
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
                        print(f"🎯 打出手牌 index={card_idx}「{card_name}」(共{len(cards)}张可打)")
                        await target.click()
                        await asyncio.sleep(0.6)
                        # 若需要选目标，点第一个敌人
                        hint = await page.query_selector("#target-hint.show")
                        if hint:
                            enemies = await page.query_selector_all(".enemy-box")
                            if enemies:
                                await enemies[0].click()
                    else:
                        print("⚠️ 没有可打的牌，改为结束回合")
                        await page.click("#btn-end-turn", timeout=3000)

                elif "[CLICK_BTN]" in last_line:
                    btn_text = last_line.split("[CLICK_BTN]")[-1].strip().strip('"')
                    print(f"🎯 点击按钮: {btn_text}")
                    await page.click(f"text={btn_text}", timeout=3000)

                else:
                    # 保底：标题页点第一个人物卡片，其他页点第一个可用按钮
                    print("⚠️ 格式未识别，执行保底操作...")
                    active_screen = await page.evaluate("document.querySelector('.screen.active')?.id || ''")
                    if active_screen == "screen-title":
                        await page.click(".char-card", timeout=3000)
                    else:
                        await page.click("button:not([disabled])", timeout=3000)

            except Exception as e:
                err_str = str(e)
                print(f"❌ 本步操作出现异常: {err_str}")
                # 429 重试耗尽 → 清档重开新局，step 归零从头打
                if "速率限制" in err_str:
                    await reset_game(page)
                    step = 0  # while 循环下次 +1 变 1，真正从头开始

            await asyncio.sleep(6)  # 步间等待：模型思考 + 游戏动画渲染
            
        await browser.close()

if __name__ == "__main__":
    asyncio.run(play_loop())
