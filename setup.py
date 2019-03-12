from setuptools import setup

setup(name='CMSimfly 2016 Project',
      version='1.0',
      description='OpenShift App',
      author='KMOL',
      author_email='course@mde.tw',
      url='https://www.python.org/community/sigs/current/distutils-sig',
 install_requires=['Flask>=0.10.1', 'beautifulsoup4'],
#install_requires=['Flask>=0.10.1', 'MarkupSafe', 'github3.py', 'authomatic','pytz', 'beautifulsoup4', 'pymysql', 'peewee'],
     )
     
'''
Flask 為網際程式框架
MarkupSafe
github3.py 為 Github 的 API 程式庫, 可以用程式方法管理特定倉儲的 collaborator list
authomatic 為 oauth 2 API 程式庫, 可以讓使用者透過 Gmail, Facebook, Github 或 Twitter 帳號登入
pytz 為 timezone 模組
beautifulsoup4 用來處理 html 與 xml 相關標註內容
pymysql 為 MySQL 程式庫
peewee 則為 ORM
'''
