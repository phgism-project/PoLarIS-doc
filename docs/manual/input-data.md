# 输入数据

PoLarIS 的输入数据可按用途分为地形数据、气候强迫、初始条件和边界条件。

## 数据类型

| 类型 | 示例变量 | 说明 |
| --- | --- | --- |
| 地形 | bed elevation, surface elevation | 冰床、海底地形和表面高程 |
| 冰盖状态 | ice thickness, velocity | 初始冰厚、速度和温度场 |
| 气候强迫 | SMB, temperature | 表面质量平衡和温度 |
| 海洋强迫 | melt rate, ocean temperature | 冰架底融化或海洋热强迫 |

## 文件格式

建议使用 NetCDF 作为主要输入格式，并在这里维护变量名、单位、维度和缺测值约定。
