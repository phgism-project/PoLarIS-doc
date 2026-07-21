# 安装与编译

## 系统要求
PoLarIS在Linux环境中运行。对于比较小的模拟区域或者计算量较小的案例（如单条冰川），可以在本地笔记本电脑或者台式机上面安装运行。对于较大的模拟区域和案例（如全南极和格陵兰冰盖），则需要在服务器上运行。
对于本机计算平台的设置，我们推荐使用Ubuntu Linux系统。以下是我们在Ubuntu
22.04.1系统中的安装和运行示例，电脑CPU架构是x86_64。

## 程序编译

### 并行软件安装

PoLarIS支持MPI并行化计算，我们需要首先安装能够支持并行计算的软件包。
当然，如果计算量非常小，也可以选择不使用并行，仅仅用串行计算，即仅仅启动1个MPI进程去计算。在Ubuntu中，有两个常用的并行软件，MPICH和OpenMPI，这两个软件都支持MPI并行计算。用任何一个都可以，但需要保证和其他安装包没有冲突。比如，安装Paraview的时候，Ubuntu会自动安装OpenMPI，但假如我们一开始是用MPICH来安装PoLarIS的，那么可能就会有一些冲突，导致运行PoLarIS的时候，并行模式工作不正常。因此，我们选择安装OpenMPI：

```bash
sudo apt install libopenmpi-dev
```

`apt`是Ubuntu系统中的一个能自动安装软件的包管理器，会自动处理好一些相关的依赖关系。安装完成后，我们可以编写一个简单的`mpi_hello_world.c`程序检查MPI环境是否正常：

```c
/* The Parallel Hello World Program */
#include <stdio.h> 
#include <mpi.h> 
            
int main(int argc, char **argv) 
{
    int node; 

    MPI_Init(&argc, &argv); 
    MPI_Comm_rank(MPI_COMM_WORLD, &node); 
    printf("Hello, world from node %d\n", node); 
    MPI_Finalize(); 

    return 0;
}
```

使用MPI的C编译器`mpicc`编译这个程序：

```bash
mpicc -o mpi_hello_world mpi_hello_world.c
```

编译成功后，会生成可执行文件`mpi_hello_world`。随后使用4个MPI进程运行：

```bash
mpirun -np 4 ./mpi_hello_world
```

`-np 4`表示启动4个MPI进程，`./`表示运行当前目录中的可执行文件。如果一切正常，将看到类似输出：

```text
Hello, world from node 0
Hello, world from node 1
Hello, world from node 2
Hello, world from node 3
```

不同进程输出内容的显示顺序可能有所不同。只要4个MPI进程均能正常输出，就说明MPI的编译和并行运行环境基本正常。

### 数值计算库安装

很多人喜欢用MATLAB的原因是里面已经集成了几乎所有现成的、计算模拟需要用到的函数和各种库，相当于哆啦A梦的口袋，需要时直接拿来用就行，或者像是一把超级瑞士军刀，所有常用的工具都折叠在一起，非常方便。但是对于一般的计算软件，尤其是自己开发的开源软件，是没有像MATLAB这样商业软件的待遇的。比如Python，刚开始Python并不是为了计算，后来有人开发了python版的数组运算库NumPy、面向科学计算的SciPy、为了画图的Matplotlib，适应大型矩阵处理的Xarray等等，才有了现在python用来作科学计算非常红火的局面。像C语言也是，为了解决C语言求解大型方程组、满足大规模计算的需求，有人就开发了配套的“工具箱”，如果需要用到，就找到相应的工具包搭上就行。目前，比较常用的有两个，一个是美国能源部Sandia国家实验室开发的Trilinos，另一个是美国能源部阿贡实验室开发的PETSc。为什么同一个部门要做两个？也许是因为经费实在太多。

PoLarIS用到的是PETSc。所以下一步我们要安装PETSc。CMake是Linux系统里用来编译安装软件的一个工具，在安装PETSc之前请先安装CMake：

```bash
sudo apt install cmake
```

请先下载最新版本的PETSc源代码petsc-xxxx.tar.gz，然后按以下步骤安装：

```bash
tar xzf petsc-xxxx.tar.gz
cd petsc-xxxx
export PETSC_DIR=$PWD

./configure \
  --download-mumps \
  --download-superlu_dist \
  --download-parmetis \
  --download-metis \
  --download-fblaslapack \
  --download-scalapack
```

`export PETSC_DIR=$PWD`这一步的意思是要把PETSc的安装路径放到一个叫做PETSC_DIR的环境变量里面，这样后面安装PoLarIS的时候，会自动去PETSC_DIR这个地方找到PETSc。
`configure`完成后，终端末尾会给出本次配置对应的`PETSC_DIR`、`PETSC_ARCH`以及建议执行的`make`命令。优先使用终端实际输出的命令。

例如，如果`configure`输出的`PETSC_ARCH`为`arch-linux-c-opt`，可以执行：

```bash
export PETSC_ARCH=arch-linux-c-opt
```
这里的`arch-linux-c-opt`只是示例，应替换为本次`configure`实际生成的值。

随后编译PETSc：

```bash
make PETSC_DIR="$PETSC_DIR" PETSC_ARCH="$PETSC_ARCH" all
```

这里的`$PETSC_DIR`和`$PETSC_ARCH`会分别读取前面已经设置好的环境变量，无需再次手动替换。

PETSc包含多个数值计算库，编译过程可能需要较长时间。编译成功后，可以按照提示运行检查：

```bash
make PETSC_DIR="$PETSC_DIR" PETSC_ARCH="$PETSC_ARCH" check
```

如果检查通过，终端中会出现类似输出：

```text
Completed PETSc check examples
```

### NetCDF环境的安装

NetCDF是一种文件格式的标准。利用NetCDF可以对网络数据进行高效地存储、管理、获取和分发等操作。目前广泛应用于大气科学、水文、海洋学、环境模拟、地球物理等诸多领域。在PoLarIS里面，输入文件是NetCDF格式，输出文件目前暂且只支持VTK格式。
在Ubuntu上面安装NetCDF环境非常简单，运行以下三个命令：

```bash
sudo apt install libnetcdf-dev
sudo apt install libhdf5-dev
sudo apt install libpnetcdf-dev
```
其中，NetCDF用于模型数据的读取，HDF5是NetCDF常用的底层数据存储库，PnetCDF用于并行环境下的NetCDF数据访问。
随后，我们检查 HDF5 库安装目录

```bash
dpkg -L libhdf5-dev | grep libhdf5.a
```

输出如

```text
/usr/lib/x86_64-linux-gnu/hdf5/serial/libhdf5.a
```

记住此目录`/usr/lib/x86_64-linux-gnu/hdf5/serial/`

### 有限元平台PHG的安装

PHG全称是Parallel Hierarchical
Grid，是用来做有限元模拟的计算平台，由中国科学院科学与工程计算国家重点实
验室开发。PoLarIS就是基于PHG开发的。因此，我们这一步要进行PHG的安装：

```bash
cd /path/to/PoLarIS
./configure \
  --disable-shared \
  --disable-superlu \
  --with-hdf5-libdir=/usr/lib/x86_64-linux-gnu/hdf5/serial
```

`/path/to/PoLarIS`需要替换为实际的PoLarIS源码目录，`--with-hdf5-libdir`后面的路径也应使用上一节实际查询到的HDF5库目录。输出中必须要有关于NetCDF、PnetCDF、PETSc和MUMPS的成功信息:

```text
checking whether we have NETCDF ... yes
configure: *** NETCDF enabled
checking whether we have PNETCDF ... yes
configure: *** PNETCDF enabled
configure: *** PETSc solver enabled
checking whether we have MUMPS ... yes
configure: *** MUMPS solver enabled
```

然后执行

```bash
make clean
make
```
`make clean`是为了确保不受之前编译文件的影响。成功的输出如下：

```text
/usr/bin/ranlib libphg.a
make[1]: Leaving directory 'xxxx/polaris/src'
```

这样，我们就成功安装好了PHG，得到了包含PHG的静态库文件，`libphg.a`。这个静态库里面包含了各种支持有限元模拟的函数。

### PoLarIS的安装

好了，经过上面几步的准备和铺垫，我们终于来到了激动人心的时刻——安装PoLarIS。步骤非常简单，只需要两个命令，
进入到`polaris/ice-sheet/src`目录，执行：

```bash
cd ice-sheet/src
make clean
make
```

其中，`make clean`用于清除此前生成的中间文件，避免旧的编译结果影响本次编译。

如果编译成功，终端中会出现类似输出：

```text
Linking ins-flow
```

且没有报错。编译完成后，会在当前目录生成PoLarIS可执行文件：

```text
ins-flow
```

运行模拟时，可以将`ins-flow`复制到算例目录，并使用MPI启动，例如：

```bash
mpirun -n 4 ./ins-flow
```

其中，`-n 4`表示使用4个MPI进程。具体运行方法见数值模拟案例

!!! note "源码版本说明"
    上述目录和编译命令对应技术手册所使用的源码结构。不同代码分支的目录结构或编译入口可能有所不同，应以当前源码分支中实际存在的`Makefile`或构建脚本为准。

## 库版本说明
| 组件 | 建议版本 | 说明 |
| --- | --- | --- |
| 编译器 | 待补充 | Fortran / C / C++ 编译器要求 |
| MPI | 待补充 | 并行运行环境 |
| NetCDF | 待补充 | 模型输入输出 |
| HDF5 | 待补充 | 数据格式支持 |
| Python | 3.10+ | 后处理与绘图 |



## 常见编译问题

!!! warning "NetCDF 路径"
    如果编译器找不到 NetCDF，请检查 `NETCDF_ROOT`、`LD_LIBRARY_PATH` 或集群模块加载配置。
