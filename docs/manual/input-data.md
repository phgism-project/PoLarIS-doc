# 输入数据

PoLarIS 的输入数据需要三类：

- 网格文件：-mesh_file，即模式的计算网格，包含二维平面的三角网格信息，z方向范围是[0,1]。
- 地形文件：-topo_file，即表面高程、厚度、底部基岩高程，以及地热、冰温（如不耦合温度solver）等不随时间变化的量。
- 强迫文件：-forcing_file，即气候强迫数据，如表面物质平衡，海洋的热强迫等随时间变化的量。

## 数据类型

| 类型 | 示例变量 | 说明 |
| --- | --- | --- |
| 地形 | bed elevation, surface elevation | 冰床、海底地形和表面高程 |
| 冰盖状态 | ice thickness, velocity | 初始冰厚、速度和温度场 |
| 气候强迫 | SMB, temperature | 表面质量平衡和温度 |
| 海洋强迫 | melt rate, ocean temperature | 冰架底融化或海洋热强迫 |

## 文件格式

建议使用 NetCDF 作为主要输入格式，并在这里维护变量名、单位、维度和缺测值约定。
