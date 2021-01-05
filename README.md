# nodequery-server

#### 介绍
nodequery-server  基于nodequery.com的开源客户端开发的服务端。

#### 软件架构
python3
django3
mysql
mongodb
celery


#### 安装教程

1.  安装python3,pip3
2.  克隆项目代码，或者下载ZIP解压
3.  安装依赖:pip -r requirement.txt
4.  安装mysql(>=5.7),mongodb(>=4.2)
5.  配置项目录下nqmonitor/setting.py 根据注释填写mysql和mongodb的信息，注意数据库名为nqmonitor
6.  安装gunicorn和supervisor,配置django 进程守护
7.  安装nginx并配置gunicorn代理

#### 使用说明

1.  xxxx
2.  xxxx
3.  xxxx

#### 参与贡献

1.  Fork 本仓库
2.  新建 Feat_xxx 分支
3.  提交代码
4.  新建 Pull Request


#### 特技

1.  使用 Readme\_XXX.md 来支持不同的语言，例如 Readme\_en.md, Readme\_zh.md
2.  Gitee 官方博客 [blog.gitee.com](https://blog.gitee.com)
3.  你可以 [https://gitee.com/explore](https://gitee.com/explore) 这个地址来了解 Gitee 上的优秀开源项目
4.  [GVP](https://gitee.com/gvp) 全称是 Gitee 最有价值开源项目，是综合评定出的优秀开源项目
5.  Gitee 官方提供的使用手册 [https://gitee.com/help](https://gitee.com/help)
6.  Gitee 封面人物是一档用来展示 Gitee 会员风采的栏目 [https://gitee.com/gitee-stars/](https://gitee.com/gitee-stars/)
