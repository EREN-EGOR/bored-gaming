import asyncio
from browser_use import Agent
from langchain_anthropic import ChatAnthropic

llm = ChatAnthropic(
    model_name="rl_d8f3uat5tb1000cjp03g", 
    anthropic_api_key="xtalpi-horologium-51d66e43-60a6-464f-ba5b-5f8c5890c7ba", 
    anthropic_api_url="https://horologium-ai.chat", 
    max_tokens=4096, 
    default_headers={"anthropic-version": "2023-06-01"} 
)

# 转换为本地浏览器路径
game_url = r"file:///C:/Users/minghe.xu/Desktop/geimu/bored-gaming/save_the_load.html"

async def main():
    agent = Agent(
        task=f"打开本地网页 {game_url}，并告诉我你看到了什么游戏画面。",
        llm=llm,
    )
    await agent.run()

if __name__ == "__main__":
    asyncio.run(main())