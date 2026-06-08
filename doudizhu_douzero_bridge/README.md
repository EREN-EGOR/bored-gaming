# 单机斗地主：DouZero 后端接入版

这个版本不再使用前端启发式 AI。

前端负责牌局显示、玩家操作和基础规则校验；电脑出牌会请求本地 Python 后端，由后端调用 DouZero 的 `DeepAgent` 模型进行决策。

## 1. 项目结构

```text
doudizhu_douzero_bridge/
├─ frontend/
│  └─ doudizhu_douzero_frontend.html
├─ backend/
│  ├─ server.py
│  └─ requirements.txt
├─ models/
│  └─ douzero_ADP/
│     ├─ landlord.ckpt
│     ├─ landlord_down.ckpt
│     └─ landlord_up.ckpt
├─ README.md
└─ start_backend_windows.bat
```

## 2. 环境要求

建议使用：

```text
Python 3.8 - 3.10
```

Windows 可以只用 CPU 推理，不需要显卡。

不太建议使用 Python 3.12，因为 DouZero 是较早的项目，部分依赖可能不兼容。

## 3. 创建并激活虚拟环境

进入项目目录：

```bash
cd doudizhu_douzero_bridge
```

创建虚拟环境：

```bash
python -m venv .venv
```

激活虚拟环境：

```bash
.venv\Scripts\activate
```

升级 pip：

```bash
python -m pip install --upgrade pip
```

安装基础依赖：

```bash
python -m pip install -r backend/requirements.txt
```

建议使用 `python -m pip install ...`，不要直接用 `pip install ...`。这样可以确保依赖安装到当前虚拟环境里。

## 4. 安装 DouZero

如果启动后端时报错：

```text
No module named 'douzero'
```

说明当前 Python 环境里没有安装 DouZero。

先尝试直接安装：

```bash
python -m pip install douzero
```

安装后测试：

```bash
python -c "import douzero; print(douzero.__file__)"
```

如果能输出路径，说明 DouZero 安装成功。

如果 `python -m pip install douzero` 失败，可以从官方 GitHub 源码安装：

```bash
mkdir external
git clone https://github.com/kwai/DouZero.git external/DouZero
cd external/DouZero
python -m pip install -e .
cd ../../
```

然后再次测试：

```bash
python -c "import douzero; print(douzero.__file__)"
```

## 5. 安装 GitPython

如果运行时报错：

```text
No module named 'git'
```

说明缺少 GitPython。

注意：这里不要安装名为 `git` 的 Python 包，应该安装 `GitPython`：

```bash
python -m pip install GitPython
```

测试是否安装成功：

```bash
python -c "import git; print(git.__version__)"
```

如果这里仍然报错，检查系统里是否安装了 Git：

```bash
git --version
```

如果提示找不到 `git` 命令，需要安装 Git for Windows。安装时建议选择：

```text
Add Git to PATH
```

安装完成后，关闭当前终端，重新打开终端，再进入项目目录并激活虚拟环境：

```bash
cd doudizhu_douzero_bridge
.venv\Scripts\activate
```

## 6. 启动后端

确保已经进入项目目录并激活虚拟环境：

```bash
cd doudizhu_douzero_bridge
.venv\Scripts\activate
```

启动后端：

```bash
python backend/server.py
```

如果启动成功，终端会显示本地服务地址，例如：

```text
http://127.0.0.1:5000
```

## 7. 打开前端页面

后端启动后，打开：

```text
frontend/doudizhu_douzero_frontend.html
```

如果页面提示：

```text
DouZero 后端未连接
```

通常有以下几种原因：

1. `backend/server.py` 没有启动；
2. Python 虚拟环境没有激活；
3. `douzero` 没有安装成功；
4. `GitPython` 没有安装成功；
5. 系统没有安装 Git；
6. 模型文件没有放到正确路径；
7. 浏览器无法访问本地后端地址。

## 8. 快速检查命令

如果运行失败，可以依次执行下面这些命令检查环境。

检查 Python 版本：

```bash
python --version
```

检查 DouZero 是否可导入：

```bash
python -c "import douzero; print(douzero.__file__)"
```

检查 GitPython 是否可导入：

```bash
python -c "import git; print(git.__version__)"
```

检查系统 Git：

```bash
git --version
```

检查模型文件是否存在：

```bash
dir models\douzero_ADP
```

正常情况下应该能看到：

```text
landlord.ckpt
landlord_down.ckpt
landlord_up.ckpt
```

## 9. 常见问题

### 问题 1：No module named 'douzero'

说明 DouZero 没有安装到当前 Python 环境。

解决方法：

```bash
python -m pip install douzero
```

如果失败，使用源码安装：

```bash
mkdir external
git clone https://github.com/kwai/DouZero.git external/DouZero
cd external/DouZero
python -m pip install -e .
cd ../../
```

### 问题 2：No module named 'git'

说明缺少 GitPython。

解决方法：

```bash
python -m pip install GitPython
```

### 问题 3：git 不是内部或外部命令

说明系统没有安装 Git，或者 Git 没有加入 PATH。

解决方法：

1. 安装 Git for Windows；
2. 安装时选择 `Add Git to PATH`；
3. 重新打开终端；
4. 输入：

```bash
git --version
```

能显示版本号即可。

### 问题 4：模型加载失败

检查模型是否放在：

```text
models/douzero_ADP/
```

并确认里面有：

```text
landlord.ckpt
landlord_down.ckpt
landlord_up.ckpt
```

路径放错会导致后端无法调用 DouZero。

## 11. requirements.txt 建议内容

`backend/requirements.txt` 至少建议包含：

```text
flask
flask-cors
GitPython
douzero
```

如果 `douzero` 通过源码安装，也可以不写进 `requirements.txt`，但 README 里必须保留源码安装步骤。

## 12. Git 提交建议

不建议把虚拟环境、模型权重和外部源码仓库直接提交到 Git。

建议 `.gitignore` 中包含：

```gitignore
.venv/
__pycache__/
*.pyc
models/douzero_ADP/*.ckpt
external/
```

模型文件较大，建议在 README 中说明下载方式，让使用者自己放入 `models/douzero_ADP/`。

## 13. 当前版本说明

这个版本的基本流程是：

1. 前端负责发牌、显示、玩家出牌和基础规则校验；
2. 电脑出牌时，前端把当前牌局状态发送给 Python 后端；
3. 后端把当前牌局转换为 DouZero 可识别的状态；
4. DouZero `DeepAgent` 根据模型输出电脑出牌；
5. 前端接收结果并更新牌局。
