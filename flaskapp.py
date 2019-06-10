# coding: utf-8
from flask import Flask, send_from_directory, request, redirect, \
    render_template, session, make_response, url_for, flash
import random
import math
import os
# init.py 為自行建立的起始物件
import init
# 利用 nocache.py 建立 @nocache decorator, 讓頁面不會留下 cache
from nocache import nocache
# the followings are for cmsimfly
import re
import os
import math
import hashlib
# use quote_plus() to generate URL
import urllib.parse
# use cgi.escape() to resemble php htmlspecialchars()
# use cgi.escape() or html.escape to generate data for textarea tag, otherwise Editor can not deal with some Javascript code.
import cgi
import sys
# for new parse_content function
#from bs4 import BeautifulSoup
# 為了使用 bs4.element, 改為 import bs4
import bs4
# for ssavePage and savePage
import shutil

# get the current directory of the file
_curdir = os.path.join(os.getcwd(), os.path.dirname(__file__))
sys.path.append(_curdir)

# 由 init.py 中的 uwsgi = False 或 True 決定在 uwsgi 模式或近端模式執行

#ends for cmsimfly

# 假如隨後要利用 blueprint 架構時, 可以將程式放在子目錄中
# 然後利用 register 方式導入
# 導入 g1 目錄下的 user1.py
#import users.g1.user1

# 確定程式檔案所在目錄, 在 Windows 有最後的反斜線
_curdir = os.path.join(os.getcwd(), os.path.dirname(__file__))
# 表示程式在近端執行, 最後必須決定是由 init.py 或此地決定目錄設定
config_dir = _curdir + "/config/"
static_dir = _curdir + "/static"
download_dir = _curdir + "/downloads/"
image_dir = _curdir + "/images/"

# 利用 init.py 啟動, 建立所需的相關檔案
initobj = init.Init()
# 取 init.py 中 Init 類別中的 class uwsgi 變數 (static variable) 設定
uwsgi = init.Init.uwsgi

# 必須先將 download_dir 設為 static_folder, 然後才可以用於 download 方法中的 app.static_folder 的呼叫
app = Flask(__name__)

# 設置隨後要在 blueprint 應用程式中引用的 global 變數
app.config['config_dir'] = config_dir
app.config['static_dir'] = static_dir
app.config['download_dir'] = download_dir

# 使用 session 必須要設定 secret_key
# In order to use sessions you have to set a secret key
# set the secret key.  keep this really secret:
app.secret_key = 'A0Zr9@8j/3yX R~XHH!jmN]LWX/,?R@T'

# 子目錄中註冊藍圖位置
#app.register_blueprint(users.g1.user1.g1app)


@app.route('/checkLogin', methods=['POST'])
def checkLogin():
    """Check user login process."""
    password = request.form["password"]
    site_title, saved_password = parse_config()
    hashed_password = hashlib.sha512(password.encode('utf-8')).hexdigest()
    if hashed_password == saved_password:
        session['admin'] = 1
        return redirect('/edit_page')
    return redirect('/')

 
@app.route('/delete_file', methods=['POST'])
def delete_file():
    """Delete user uploaded files."""
    if not isAdmin():
        return redirect("/login")
    head, level, page = parse_content()
    directory = render_menu(head, level, page)
    filename = request.form['filename']
    if filename is None:
        outstring = "no file selected!"
        return set_css() + "<div class='container'><nav>" + \
                   directory + "</nav><section><h1>Delete Error</h1>" + \
                   outstring + "<br/><br /></body></html>"
    outstring = "delete all these files?<br /><br />"
    outstring += "<form method='post' action='doDelete'>"
    # only one file is selected
    if isinstance(filename, str):
        outstring += filename + "<input type='hidden' name='filename' value='" + \
                            filename + "'><br />"
    else:
        # multiple files selected
        for index in range(len(filename)):
            outstring += filename[index] + "<input type='hidden' name='filename' value='" + \
                                filename[index]+"'><br />"
    outstring += "<br /><input type='submit' value='delete'></form>"

    return set_css() + "<div class='container'><nav>" + \
               directory + "</nav><section><h1>Download List</h1>" + \
               outstring + "<br/><br /></body></html>"


@app.route('/doDelete', methods=['POST'])
def doDelete():
    """Action to delete user uploaded files."""
    if not isAdmin():
        return redirect("/login")
    # delete files
    filename = request.form['filename']
    outstring = "all these files will be deleted:<br /><br />"
    # only select one file
    if isinstance(filename, str):
        try:
            os.remove(download_dir + "/" + filename)
            outstring += filename + " deleted!"
        except:
            outstring += filename + "Error, can not delete files!<br />"
    else:
        # multiple files selected
        for index in range(len(filename)):
            try:
                os.remove(download_dir + "/" + filename[index])
                outstring += filename[index] + " deleted!<br />"
            except:
                outstring += filename[index] + "Error, can not delete files!<br />"

    head, level, page = parse_content()
    directory = render_menu(head, level, page)

    return set_css() + "<div class='container'><nav>" + \
               directory + "</nav><section><h1>Download List</h1>" + \
               outstring + "<br/><br /></body></html>"


@app.route('/doSearch', methods=['POST'])
def doSearch():
    """Action to search content.htm using keyword"""
    if not isAdmin():
        return redirect("/login")
    else:
        keyword = request.form['keyword']
        head, level, page = parse_content()
        directory = render_menu(head, level, page)
        match = ""
        for index in range(len(head)):
            if (keyword != "" or None) and (keyword.lower() in page[index].lower() or \
            keyword.lower() in head[index].lower()): \
                match += "<a href='/get_page/" + head[index] + "'>" + \
                                head[index] + "</a><br />"
        return set_css() + "<div class='container'><nav>"+ \
                   directory + "</nav><section><h1>Search Result</h1>keyword: " + \
                   keyword.lower() + "<br /><br />in the following pages:<br /><br />" + \
                   match + "</section></div></body></html>"


@app.route('/download/', methods=['GET'])
def download():
    """Download file using URL."""
    filename = request.args.get('filename')
    type = request.args.get('type')
    if type == "files":
        return send_from_directory(download_dir, filename=filename)
    else:
    # for image files
        return send_from_directory(image_dir, filename=filename)
    

@app.route('/download_list', methods=['GET'])
def download_list():
    """List files in downloads directory."""
    if not isAdmin():
        return redirect("/login")
    else:
        if not request.args.get('edit'):
            edit= 1
        else:
            edit = request.args.get('edit')
        if not request.args.get('page'):
            page = 1
        else:
            page = request.args.get('page')
        if not request.args.get('item_per_page'):
            item_per_page = 10
        else:
            item_per_page = request.args.get('item_per_page')
        if not request.args.get('keyword'):
            keyword = ""
        else:
            keyword = request.args.get('keyword')
            session['download_keyword'] = keyword
    files = os.listdir(download_dir)
    if keyword is not "":
        files = [elem for elem in files if str(keyword) in elem]
    files.sort()
    total_rows = len(files)
    totalpage = math.ceil(total_rows/int(item_per_page))
    starti = int(item_per_page) * (int(page) - 1) + 1
    endi = starti + int(item_per_page) - 1
    outstring = "<form method='post' action='delete_file'>"
    notlast = False
    if total_rows > 0:
        outstring += "<br />"
        if (int(page) * int(item_per_page)) < total_rows:
            notlast = True
        if int(page) > 1:
            outstring += "<a href='"
            outstring += "download_list?&amp;page=1&amp;item_per_page=" + str(item_per_page) + \
                                "&amp;keyword=" + str(session.get('download_keyword'))
            outstring += "'><<</a> "
            page_num = int(page) - 1
            outstring += "<a href='"
            outstring += "download_list?&amp;page=" + str(page_num) + "&amp;item_per_page=" + \
                                str(item_per_page) + "&amp;keyword=" + str(session.get('download_keyword'))
            outstring += "'>Previous</a> "

        span = 10

        for index in range(int(page)-span, int(page)+span):
            if index>= 0 and index< totalpage:
                page_now = index + 1 
                if page_now == int(page):
                    outstring += "<font size='+1' color='red'>" + str(page) + " </font>"
                else:
                    outstring += "<a href='"
                    outstring += "download_list?&amp;page=" + str(page_now) + "&amp;item_per_page=" + \
                                        str(item_per_page) + "&amp;keyword=" + str(session.get('download_keyword'))
                    outstring += "'>"+str(page_now) + "</a> "

        if notlast == True:
            nextpage = int(page) + 1
            outstring += " <a href='"
            outstring += "download_list?&amp;page=" + str(nextpage) + "&amp;item_per_page=" + \
                                str(item_per_page) + "&amp;keyword=" + str(session.get('download_keyword'))
            outstring += "'>Next</a>"
            outstring += " <a href='"
            outstring += "download_list?&amp;page=" + str(totalpage) + "&amp;item_per_page=" + \
                                str(item_per_page) + "&amp;keyword=" + str(session.get('download_keyword'))
            outstring += "'>>></a><br /><br />"

        if (int(page) * int(item_per_page)) < total_rows:
            notlast = True
            outstring += downloadlist_access_list(files, starti, endi) + "<br />"
        else:
            outstring += "<br /><br />"
            outstring += downloadlist_access_list(files, starti, total_rows) + "<br />"

        if int(page) > 1:
            outstring += "<a href='"
            outstring += "download_list?&amp;page=1&amp;item_per_page=" + str(item_per_page) + \
                                "&amp;keyword=" + str(session.get('download_keyword'))
            outstring += "'><<</a> "
            page_num = int(page) - 1
            outstring += "<a href='"
            outstring += "download_list?&amp;page=" + str(page_num) + "&amp;item_per_page=" + \
                                str(item_per_page) + "&amp;keyword=" + str(session.get('download_keyword'))
            outstring += "'>Previous</a> "

        span = 10

        for index in range(int(page)-span, int(page)+span):
        #for ($j=$page-$range;$j<$page+$range;$j++)
            if index >=0 and index < totalpage:
                page_now = index + 1
                if page_now == int(page):
                    outstring += "<font size='+1' color='red'>" + str(page)+" </font>"
                else:
                    outstring += "<a href='"
                    outstring += "download_list?&amp;page=" + str(page_now) + \
                                        "&amp;item_per_page=" + str(item_per_page) + \
                                        "&amp;keyword=" + str(session.get('download_keyword'))
                    outstring += "'>" + str(page_now)+"</a> "

        if notlast == True:
            nextpage = int(page) + 1
            outstring += " <a href='"
            outstring += "download_list?&amp;page=" + str(nextpage) + "&amp;item_per_page=" + \
                                str(item_per_page) + "&amp;keyword=" + str(session.get('download_keyword'))
            outstring += "'>Next</a>"
            outstring += " <a href='"
            outstring += "download_list?&amp;page=" + str(totalpage) + "&amp;item_per_page=" + \
                                str(item_per_page) + "&amp;keyword=" + str(session.get('download_keyword'))
            outstring += "'>>></a>"
    else:
        outstring += "no data!"
    outstring += "<br /><br /><input type='submit' value='delete'><input type='reset' value='reset'></form>"

    head, level, page = parse_content()
    directory = render_menu(head, level, page)

    return set_css() + "<div class='container'><nav>" + \
               directory + "</nav><section><h1>Download List</h1>" + outstring + "<br/><br /></body></html>"


def downloadlist_access_list(files, starti, endi):
    """List files function for download_list."""
    # different extension files, associated links were provided
    # popup window to view images, video or STL files, other files can be downloaded directly
    # files are all the data to list, from starti to endi
    # add file size
    outstring = ""
    for index in range(int(starti)-1, int(endi)):
        fileName, fileExtension = os.path.splitext(files[index])
        fileExtension = fileExtension.lower()
        fileSize = sizeof_fmt(os.path.getsize(download_dir+"/"+files[index]))
        # images files
        if fileExtension == ".png" or fileExtension == ".jpg" or fileExtension == ".gif":
            outstring += '<input type="checkbox" name="filename" value="' + \
                              files[index] + '"><a href="javascript:;" onClick="window.open(\'/images/'+ \
                              files[index] + '\',\'images\', \'catalogmode\',\'scrollbars\')">' + \
                              files[index] + '</a> (' + str(fileSize) + ')<br />'
        # stl files
        elif fileExtension == ".stl":
            outstring += '<input type="checkbox" name="filename" value="' + \
                              files[index] + '"><a href="javascript:;" onClick="window.open(\'/static/viewstl.html?src=/downloads/' + \
                              files[index] + '\',\'images\', \'catalogmode\',\'scrollbars\')">' + \
                              files[index] + '</a> (' + str(fileSize) + ')<br />'
        # flv files
        elif fileExtension == ".flv":
            outstring += '<input type="checkbox" name="filename" value="' + \
                              files[index] + '"><a href="javascript:;" onClick="window.open(\'/flvplayer?filepath=/downloads/' + \
            files[index] + '\',\'images\', \'catalogmode\',\'scrollbars\')">' + files[index] + '</a> (' + str(fileSize) + ')<br />'
        # direct download files
        else:
            outstring += "<input type='checkbox' name='filename' value='" + files[index] + \
                              "'><a href='/downloads/" + files[index] + "'>" + files[index] + \
                              "</a> (" + str(fileSize) + ")<br />"
    return outstring


# downloads 方法主要將位於 downloads 目錄下的檔案送回瀏覽器
@app.route('/downloads/<path:path>')
def downloads(path):
    """Send files in downloads directory."""
    return send_from_directory(_curdir+"/downloads/", path)


# 與 file_selector 搭配的取檔程式
def downloadselect_access_list(files, starti, endi):
    """Accompanied with file_selector."""
    outstring = ""
    for index in range(int(starti)-1, int(endi)):
        fileName, fileExtension = os.path.splitext(files[index])
        fileSize = os.path.getsize(download_dir + "/" + files[index])
        outstring += '''<input type="checkbox" name="filename" value="''' + \
                          files[index] + '''"><a href="#" onclick='window.setLink("/downloads/''' + \
                          files[index] + '''",0); return false;'>''' + files[index] + \
                          '''</a> (''' + str(sizeof_fmt(fileSize)) + ''')<br />'''
    return outstring


@app.route('/edit_config', defaults={'edit': 1})
@app.route('/edit_config/<path:edit>')
def edit_config(edit):
    """Config edit html form."""
    head, level, page = parse_content()
    directory = render_menu(head, level, page)
    if not isAdmin():
        return set_css() + "<div class='container'><nav>" + \
                 directory + "</nav><section><h1>Login</h1><form method='post' action='checkLogin'> \
                 Password:<input type='password' name='password'> \
                 <input type='submit' value='login'></form> \
                 </section></div></body></html>"
    else:
        site_title, password = parse_config()
        # edit config file
        return set_css() + "<div class='container'><nav>" + \
                 directory + "</nav><section><h1>Edit Config</h1><form method='post' action='saveConfig'> \
                 Site Title:<input type='text' name='site_title' value='"+site_title+"' size='50'><br /> \
                 Password:<input type='text' name='password' value='"+password+"' size='50'><br /> \
                 <input type='hidden' name='password2' value='"+password+"'> \
                 <input type='submit' value='send'></form> \
                 </section></div></body></html>"


# edit all page content
@app.route('/edit_page', defaults={'edit': 1})
@app.route('/edit_page/<path:edit>')
def edit_page(edit):
    """Page edit html form."""
    # check if administrator
    if not isAdmin():
        return redirect('/login')
    else:
        head, level, page = parse_content()
        directory = render_menu(head, level, page)
        pagedata =file_get_contents(config_dir + "content.htm")
        outstring = tinymce_editor(directory, cgi.escape(pagedata))
        return outstring


def editorfoot():
    return '''<body>'''


def editorhead():
    return '''
    <br />
<!--<script src="//cdn.tinymce.com/4/tinymce.min.js"></script>-->
<script src="/static/tinymce4/tinymce/tinymce.min.js"></script>
<script src="/static/tinymce4/tinymce/plugins/sh4tinymce/plugin.min.js"></script>
<link rel = "stylesheet" href = "/static/tinymce4/tinymce/plugins/sh4tinymce/style/style.css">
<script>
tinymce.init({
  selector: "textarea",
  height: 500,
  element_format : "html",
  language : "en",
  valid_elements : '*[*]',
  extended_valid_elements: "script[language|type|src]",
  plugins: [
    'advlist autolink lists link image charmap print preview hr anchor pagebreak',
    'searchreplace wordcount visualblocks visualchars code fullscreen',
    'insertdatetime media nonbreaking save table contextmenu directionality',
    'emoticons template paste textcolor colorpicker textpattern imagetools sh4tinymce'
  ],
  toolbar1: 'insertfile save undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent',
  toolbar2: 'link image | print preview media | forecolor backcolor emoticons | code sh4tinymce',
  relative_urls: false,
  toolbar_items_size: 'small',
  file_picker_callback: function(callback, value, meta) {
        cmsFilePicker(callback, value, meta);
    },
  templates: [
    { title: 'Test template 1', content: 'Test 1' },
    { title: 'Test template 2', content: 'Test 2' }
  ],
  content_css: [
    '//fonts.googleapis.com/css?family=Lato:300,300i,400,400i',
    '//www.tinymce.com/css/codepen.min.css'
  ]
});

function cmsFilePicker(callback, value, meta) {
    tinymce.activeEditor.windowManager.open({
        title: 'Uploaded File Browser',
        url: '/file_selector?type=' + meta.filetype,
        width: 800,
        height: 550,
    }, {
        oninsert: function (url, objVals) {
            callback(url, objVals);
        }
    });
};
</script>
'''


@app.route('/error_log')
def error_log(self, info="Error"):
    head, level, page = parse_content()
    directory = render_menu(head, level, page)
    return set_css() + "<div class='container'><nav>" + \
             directory + "</nav><section><h1>ERROR</h1>" + info + "</section></div></body></html>"


def file_get_contents(filename):
    # open file in utf-8 and return file content
    with open(filename, encoding="utf-8") as file:
        return file.read()


# 與 file_selector 配合, 用於 Tinymce4 編輯器的檔案選擇
def file_lister(directory, type=None, page=1, item_per_page=10):
    files = os.listdir(directory)
    total_rows = len(files)
    totalpage = math.ceil(total_rows/int(item_per_page))
    starti = int(item_per_page) * (int(page) - 1) + 1
    endi = starti + int(item_per_page) - 1
    outstring = file_selector_script()
    notlast = False
    if total_rows > 0:
        outstring += "<br />"
        if (int(page) * int(item_per_page)) < total_rows:
            notlast = True
        if int(page) > 1:
            outstring += "<a href='"
            outstring += "file_selector?type=" + type + \
                              "&amp;page=1&amp;item_per_page=" + \
                              str(item_per_page) + "&amp;keyword=" + str(session.get('download_keyword'))
            outstring += "'><<</a> "
            page_num = int(page) - 1
            outstring += "<a href='"
            outstring += "file_selector?type=" + type + \
                              "&amp;page=" + str(page_num) + \
                              "&amp;item_per_page=" +str(item_per_page) + \
                              "&amp;keyword=" + str(session.get('download_keyword'))
            outstring += "'>Previous</a> "
        span = 10
        for index in range(int(page)-span, int(page)+span):
            if index>= 0 and index< totalpage:
                page_now = index + 1 
                if page_now == int(page):
                    outstring += "<font size='+1' color='red'>" + str(page) + " </font>"
                else:
                    outstring += "<a href='"
                    outstring += "file_selector?type=" + type + "&amp;page=" + \
                                      str(page_now) + "&amp;item_per_page=" + \
                                      str(item_per_page) + "&amp;keyword=" + \
                                      str(session.get('download_keyword'))
                    outstring += "'>" + str(page_now)+"</a> "

        if notlast == True:
            nextpage = int(page) + 1
            outstring += " <a href='"
            outstring += "file_selector?type=" + type + "&amp;page=" + \
                               str(nextpage) + "&amp;item_per_page=" + \
                               str(item_per_page) + "&amp;keyword=" + \
                               str(session.get('download_keyword'))
            outstring += "'>Next</a>"
            outstring += " <a href='"
            outstring += "file_selector?type=" + type + "&amp;page=" + \
                               str(totalpage) + "&amp;item_per_page=" + \
                               str(item_per_page) + "&amp;keyword=" + \
                               str(session.get('download_keyword'))
            outstring += "'>>></a><br /><br />"
        if (int(page) * int(item_per_page)) < total_rows:
            notlast = True
            if type == "file":
                outstring += downloadselect_access_list(files, starti, endi) + "<br />"
            else:
                outstring += imageselect_access_list(files, starti, endi) + "<br />"
        else:
            outstring += "<br /><br />"
            if type == "file":
                outstring += downloadselect_access_list(files, starti, total_rows) + "<br />"
            else:
                outstring += imageselect_access_list(files, starti, total_rows) + "<br />"
        if int(page) > 1:
            outstring += "<a href='"
            outstring += "file_selector?type=" + type + \
                              "&amp;page=1&amp;item_per_page=" + str(item_per_page) + \
                              "&amp;keyword=" + str(session.get('download_keyword'))
            outstring += "'><<</a> "
            page_num = int(page) - 1
            outstring += "<a href='"
            outstring += "file_selector?type=" + type + "&amp;page=" + \
                               str(page_num) + "&amp;item_per_page=" + \
                               str(item_per_page) + "&amp;keyword=" + \
                               str(session.get('download_keyword'))
            outstring += "'>Previous</a>"
        span = 10
        for index in range(int(page)-span, int(page)+span):
            if index >=0 and index < totalpage:
                page_now = index + 1
                if page_now == int(page):
                    outstring += "<font size='+1' color='red'>"+str(page)+" </font>"
                else:
                    outstring += "<a href='"
                    outstring += "file_selector?type=" + type + "&amp;page=" + \
                                       str(page_now) + "&amp;item_per_page=" + \
                                       str(item_per_page) + "&amp;keyword=" + \
                                       str(session.get('download_keyword'))
                    outstring += "'>" + str(page_now) + "</a> "
        if notlast == True:
            nextpage = int(page) + 1
            outstring += " <a href='"
            outstring += "file_selector?type=" + type + "&amp;page=" + \
                               str(nextpage) + "&amp;item_per_page=" + \
                               str(item_per_page) + "&amp;keyword=" + \
                               str(session.get('download_keyword'))
            outstring += "'>Next</a>"
            outstring += " <a href='"
            outstring += "file_selector?type=" + type + "&amp;page=" + \
                               str(totalpage) + "&amp;item_per_page=" + \
                               str(item_per_page) + "&amp;keyword=" + str(session.get('download_keyword'))
            outstring += "'>>></a>"
    else:
        outstring += "no data!"

    if type == "file":
        return outstring+"<br /><br /><a href='fileuploadform'>file upload</a>"
    else:
        return outstring+"<br /><br /><a href='imageuploadform'>image upload</a>"


# 配合 Tinymce4 讓使用者透過 html editor 引用所上傳的 files 與 images
@app.route('/file_selector', methods=['GET'])
def file_selector():
    if not isAdmin():
        return redirect("/login")
    else:
        if not request.args.get('type'):
            type= "file"
        else:
            type = request.args.get('type')
        if not request.args.get('page'):
            page = 1
        else:
            page = request.args.get('page')
        if not request.args.get('item_per_page'):
            item_per_page = 10
        else:
            item_per_page = request.args.get('item_per_page')
        if not request.args.get('keyword'):
            keyword = None
        else:
            keyword = request.args.get('keyword')

        if type == "file":

            return file_lister(download_dir, type, page, item_per_page)
        elif type == "image":
            return file_lister(image_dir, type, page, item_per_page)


def file_selector_script():
    return '''
<script language="javascript" type="text/javascript">
$(function(){
    $('.a').on('click', function(event){
        setLink();
    });
});

function setLink (url, objVals) {
    top.tinymce.activeEditor.windowManager.getParams().oninsert(url, objVals);
    top.tinymce.activeEditor.windowManager.close();
    return false;
}
</script>
'''


@app.route('/fileaxupload', methods=['POST'])
# ajax jquery chunked file upload for flask
def fileaxupload():
    if isAdmin():
        # need to consider if the uploaded filename already existed.
        # right now all existed files will be replaced with the new files
        filename = request.args.get("ax-file-name")
        flag = request.args.get("start")
        if flag == "0":
            file = open(_curdir + "/downloads/" + filename, "wb")
        else:
            file = open(_curdir + "/downloads/" + filename, "ab")
        file.write(request.stream.read())
        file.close()
        return "files uploaded!"
    else:
        return redirect("/login")


@app.route('/fileuploadform', defaults={'edit':1})
@app.route('/fileuploadform/<path:edit>')
def fileuploadform(edit):
    if isAdmin():
        head, level, page = parse_content()
        directory = render_menu(head, level, page)
        return set_css() + "<div class='container'><nav>"+ \
                 directory + "</nav><section><h1>file upload</h1>" + \
                 '''<script src="/static/jquery.js" type="text/javascript"></script>
<script src="/static/axuploader.js" type="text/javascript"></script>
<script>
$(document).ready(function(){
$('.prova').axuploader({url:'fileaxupload', allowExt:['jpg','png','gif','7z','pdf','zip','flv','stl','swf'],
finish:function(x,files)
    {
        alert('All files have been uploaded: '+files);
    },
enable:true,
remotePath:function(){
return 'downloads/';
}
});
});
</script>
<div class="prova"></div>
<input type="button" onclick="$('.prova').axuploader('disable')" value="asd" />
<input type="button" onclick="$('.prova').axuploader('enable')" value="ok" />
</section></body></html>
'''
    else:
        return redirect("/login")


@app.route('/flvplayer')
# 需要檢視能否取得 filepath 變數
def flvplayer(filepath=None):
    outstring = '''
<object type="application/x-shockwave-flash" data="/static/player_flv_multi.swf" width="320" height="240">
     <param name="movie" value="player_flv_multi.swf" />
     <param name="allowFullScreen" value="true" />
     <param name="FlashVars" value="flv=''' + filepath + '''&amp;width=320&amp;height=240&amp;showstop=1&amp;showvolume=1&amp;showtime=1
     &amp;startimage=/static/startimage_en.jpg&amp;showfullscreen=1&amp;bgcolor1=189ca8&amp;bgcolor2=085c68
     &amp;playercolor=085c68" />
</object>
'''
    return outstring


@app.route('/generate_pages')
def generate_pages():
    # 必須決定如何處理重複標題頁面的轉檔
    import os
    # 確定程式檔案所在目錄, 在 Windows 有最後的反斜線
    _curdir = os.path.join(os.getcwd(), os.path.dirname(__file__))
    # 根據 content.htm 內容, 逐一產生各頁面檔案
    # 在此也要同時配合 render_menu2, 產生對應的 anchor 連結
    head, level, page = parse_content()
    # 處理重複標題 head 數列， 再重複標題按照次序加上 1, 2, 3...
    newhead = []
    for i, v in enumerate(head):
        # 各重複標題總數
        totalcount = head.count(v)
        # 目前重複標題出現總數
        count = head[:i].count(v)
        # 針對重複標題者, 附加目前重複標題出現數 +1, 未重複採原標題
        newhead.append(v + "-" + str(count + 1) if totalcount > 1 else v)
    # 刪除 content 目錄中所有 html 檔案
    filelist = [ f for f in os.listdir(_curdir + "\\content\\") if f.endswith(".html") ]
    for f in filelist:
        os.remove(os.path.join(_curdir + "\\content\\", f))
    # 這裡需要建立專門寫出 html 的 write_page
    # index.html
    with open(_curdir + "\\content\\index.html", "w", encoding="utf-8") as f:
        f.write(get_page2(None, newhead, 0))
    # sitemap
    with open(_curdir + "\\content\\sitemap.html", "w", encoding="utf-8") as f:
        # sitemap2 需要 newhead
        f.write(sitemap2(newhead))
    # 以下轉檔, 改用 newhead 數列

    def visible(element):
        if element.parent.name in ['style', 'script', '[document]', 'head', 'title']:
            return False
        elif re.match('<!--.*-->', str(element.encode('utf-8'))):
            return False
        return True

    search_content = []
    for i in range(len(newhead)):
        # 在此必須要將頁面中的 /images/ 字串換為 images/, /downloads/ 換為 downloads/
        # 因為 Flask 中靠 /images/ 取檔案, 但是一般 html 則採相對目錄取檔案
        # 此一字串置換在 get_page2 中進行
        # 加入 tipue search 模式
        get_page_content = []
        html_doc = get_page2(newhead[i], newhead, 0, get_page_content)
        soup = bs4.BeautifulSoup(" ".join(get_page_content), "lxml")
        search_content.append({"title": newhead[i], "text": " ".join(filter(visible, soup.findAll(text=True))), "tags": "", "url": newhead[i] + ".html"})
        with open(_curdir + "\\content\\" + newhead[i] + ".html", "w", encoding="utf-8") as f:
            # 增加以 newhead 作為輸入
            f.write(html_doc)
    # GENERATE js file
    with open(_curdir + "\\content\\tipuesearch_content.js", "w", encoding="utf-8") as f:
        f.write("var tipuesearch = {\"pages\": " + str(search_content) + "};")
    # generate each page html under content directory
    return "已經將網站轉為靜態網頁. <a href='/'>Home</a>"
# seperate page need heading and edit variables, if edit=1, system will enter edit mode
# single page edit will use ssavePage to save content, it means seperate save page
@app.route('/get_page')
@app.route('/get_page/<heading>', defaults={'edit': 0})
@app.route('/get_page/<heading>/<int:edit>')
def get_page(heading, edit):
    head, level, page = parse_content()
    directory = render_menu(head, level, page)
    if heading is None:
        heading = head[0]
    # 因為同一 heading 可能有多頁, 因此不可使用 head.index(heading) 搜尋 page_order
    page_order_list, page_content_list = search_content(head, page, heading)
    return_content = ""
    pagedata = ""
    outstring = ""
    outstring_duplicate = ""
    pagedata_duplicate = ""
    outstring_list = []
    for i in range(len(page_order_list)):
        #page_order = head.index(heading)
        page_order = page_order_list[i]
        if page_order == 0:
            last_page = ""
        else:
            last_page = head[page_order-1] + " << <a href='/get_page/" + \
                             head[page_order-1] + "'>Previous</a>"
        if page_order == len(head) - 1:
            # no next page
            next_page = ""
        else:
            next_page = "<a href='/get_page/"+ head[page_order+1] + \
                              "'>Next</a> >> " + head[page_order+1]
        if len(page_order_list) > 1:
            return_content += last_page + " " + next_page + \
                                      "<br /><h1>" + heading + "</h1>" + \
                                      page_content_list[i] + "<br />"+ \
                                      last_page + " " + next_page + "<br /><hr>"
            pagedata_duplicate = "<h"+level[page_order] + ">" + heading + \
                                          "</h"+level[page_order] + ">" + page_content_list[i]
            outstring_list.append(last_page + " " + next_page + "<br />" + tinymce_editor(directory, cgi.escape(pagedata_duplicate), page_order))
        else:
            return_content += last_page + " " + next_page + "<br /><h1>" +\
                                      heading + "</h1>" + page_content_list[i] + "<br />" + last_page + " " + next_page
            
        pagedata += "<h"+level[page_order] + ">" + heading + "</h" + level[page_order] + ">" + page_content_list[i]
        # 利用 cgi.escape() 將 specialchar 轉成只能顯示的格式
        outstring += last_page + " " + next_page + "<br />" + tinymce_editor(directory, cgi.escape(pagedata), page_order)
    
    # edit=0 for viewpage
    if edit == 0:
        return set_css() + "<div class='container'><nav>" + \
                 directory + "</nav><section>" + return_content + "</section></div></body></html>"
    # enter edit mode
    else:
        # check if administrator
        if not isAdmin():
            redirect(url_for('login'))
        else:
            if len(page_order_list) > 1:
                # 若碰到重複頁面頁印, 且要求編輯, 則導向 edit_page
                #return redirect("/edit_page")
                for i in range(len(page_order_list)):
                    outstring_duplicate += outstring_list[i] + "<br /><hr>"
                return outstring_duplicate
            else:
            #pagedata = "<h"+level[page_order]+">"+heading+"</h"+level[page_order]+">"+search_content(head, page, heading)
            #outstring = last_page+" "+next_page+"<br />"+ tinymce_editor(directory, cgi.escape(pagedata), page_order)
                return outstring


# seperate page need heading and edit variables, if edit=1, system will enter edit mode
# single page edit will use ssavePage to save content, it means seperate save page
'''
@app.route('/get_page2')
@app.route('/get_page2/<heading>', defaults={'edit': 0})
@app.route('/get_page2/<heading>/<int:edit>')
'''
# before add tipue search function
#def get_page2(heading, head, edit):
def get_page2(heading, head, edit, get_page_content = None):
    not_used_head, level, page = parse_content()
    # 直接在此將 /images/ 換為 ./../images/, /downloads/ 換為 ./../downloads/, 以 content 為基準的相對目錄設定
    page = [w.replace('/images/', './../images/') for w in page]
    page = [w.replace('/downloads/', './../downloads/') for w in page]
    # 假如有 src="/static/ace/則換為 src="./../static/ace/
    page = [w.replace('src="/static/', 'src="./../static/') for w in page]
    directory = render_menu2(head, level, page)
    if heading is None:
        heading = head[0]
    # 因為同一 heading 可能有多頁, 因此不可使用 head.index(heading) 搜尋 page_order
    page_order_list, page_content_list = search_content(head, page, heading)
    if get_page_content is not None:
        get_page_content.extend(page_content_list)
    return_content = ""
    pagedata = ""
    outstring = ""
    outstring_duplicate = ""
    pagedata_duplicate = ""
    outstring_list = []
    for i in range(len(page_order_list)):
        #page_order = head.index(heading)
        page_order = page_order_list[i]
        if page_order == 0:
            last_page = ""
        else:
            #last_page = head[page_order-1]+ " << <a href='/get_page/" + head[page_order-1] + "'>Previous</a>"
            last_page = head[page_order-1] + " << <a href='"+head[page_order-1] + ".html'>Previous</a>"
        if page_order == len(head) - 1:
            # no next page
            next_page = ""
        else:
            #next_page = "<a href='/get_page/"+head[page_order+1] + "'>Next</a> >> " + head[page_order+1]
            next_page = "<a href='" + head[page_order+1] + ".html'>Next</a> >> " + head[page_order+1]
        if len(page_order_list) > 1:
            return_content += last_page + " " + next_page + "<br /><h1>" + \
                                      heading + "</h1>" + page_content_list[i] + \
                                      "<br />" + last_page + " "+ next_page + "<br /><hr>"
            pagedata_duplicate = "<h"+level[page_order] + ">" + heading + "</h" + level[page_order]+">"+page_content_list[i]
            outstring_list.append(last_page + " " + next_page + "<br />" + tinymce_editor(directory, cgi.escape(pagedata_duplicate), page_order))
        else:
            return_content += last_page + " " + next_page + "<br /><h1>" + \
                                      heading + "</h1>" + page_content_list[i] + \
                                      "<br />" + last_page + " " + next_page
            
        pagedata += "<h" + level[page_order] + ">" + heading + \
                          "</h" + level[page_order] + ">" + page_content_list[i]
        # 利用 cgi.escape() 將 specialchar 轉成只能顯示的格式
        outstring += last_page + " " + next_page + "<br />" + tinymce_editor(directory, cgi.escape(pagedata), page_order)
    
    # edit=0 for viewpage
    if edit == 0:
        '''
        # before add tipue search function
        return set_css2() + "<div class='container'><nav>"+ \
        directory + "</nav><section>" + return_content + "</section></div></body></html>"
        '''
        return set_css2() + "<div class='container'><nav>"+ \
        directory + "</nav><section><div id=\"tipue_search_content\">" + return_content + "</div></section></div></body></html>"
    # enter edit mode
    else:
        # check if administrator
        if not isAdmin():
            redirect(url_for('login'))
        else:
            if len(page_order_list) > 1:
                # 若碰到重複頁面頁印, 且要求編輯, 則導向 edit_page
                #return redirect("/edit_page")
                for i in range(len(page_order_list)):
                    outstring_duplicate += outstring_list[i] + "<br /><hr>"
                return outstring_duplicate
            else:
            #pagedata = "<h" + level[page_order]+">" + heading + "</h" + level[page_order] + ">" + search_content(head, page, heading)
            #outstring = last_page + " " + next_page + "<br />" + tinymce_editor(directory, cgi.escape(pagedata), page_order)
                return outstring


@app.route('/image_delete_file', methods=['POST'])
def image_delete_file():
    if not isAdmin():
        return redirect("/login")
    filename = request.form['filename']
    head, level, page = parse_content()
    directory = render_menu(head, level, page)
    if filename is None:
        outstring = "no file selected!"
        return set_css() + "<div class='container'><nav>" + \
                 directory + "</nav><section><h1>Delete Error</h1>" + \
                 outstring + "<br/><br /></body></html>"
    outstring = "delete all these files?<br /><br />"
    outstring += "<form method='post' action='image_doDelete'>"
    # only one file is selected
    if isinstance(filename, str):
        outstring += filename + "<input type='hidden' name='filename' value='" + \
                          filename + "'><br />"
    else:
        # multiple files selected
        for index in range(len(filename)):
            outstring += filename[index] + "<input type='hidden' name='filename' value='" + \
                              filename[index] + "'><br />"
    outstring += "<br /><input type='submit' value='delete'></form>"

    return set_css() + "<div class='container'><nav>" + \
             directory + "</nav><section><h1>Download List</h1>" + \
             outstring + "<br/><br /></body></html>"


@app.route('/image_doDelete', methods=['POST'])
def image_doDelete():
    if not isAdmin():
        return redirect("/login")
    # delete files
    filename = request.form['filename']
    outstring = "all these files will be deleted:<br /><br />"
    # only select one file
    if isinstance(filename, str):
        try:
            os.remove(image_dir + "/" + filename)
            outstring += filename + " deleted!"
        except:
            outstring += filename + "Error, can not delete files!<br />"
    else:
        # multiple files selected
        for index in range(len(filename)):
            try:
                os.remove(image_dir + "/" + filename[index])
                outstring += filename[index] + " deleted!<br />"
            except:
                outstring += filename[index] + "Error, can not delete files!<br />"

    head, level, page = parse_content()
    directory = render_menu(head, level, page)

    return set_css() + "<div class='container'><nav>" + \
             directory + "</nav><section><h1>Image List</h1>" + \
             outstring + "<br/><br /></body></html>"


@app.route('/image_list', methods=['GET'])
def image_list():
    if not isAdmin():
        return redirect("/login")
    else:
        if not request.args.get('edit'):
            edit= 1
        else:
            edit = request.args.get('edit')
        if not request.args.get('page'):
            page = 1
        else:
            page = request.args.get('page')
        if not request.args.get('item_per_page'):
            item_per_page = 10
        else:
            item_per_page = request.args.get('item_per_page')
        if not request.args.get('keyword'):
            keyword = ""
        else:
            keyword = request.args.get('keyword')
            session['image_keyword'] = keyword
    files = os.listdir(image_dir)
    if keyword is not "":
        files = [elem for elem in files if str(keyword) in elem]
    files.sort()
    total_rows = len(files)
    totalpage = math.ceil(total_rows/int(item_per_page))
    starti = int(item_per_page) * (int(page) - 1) + 1
    endi = starti + int(item_per_page) - 1
    outstring = "<form method='post' action='image_delete_file'>"
    notlast = False
    if total_rows > 0:
        outstring += "<br />"
        if (int(page) * int(item_per_page)) < total_rows:
            notlast = True
        if int(page) > 1:
            outstring += "<a href='"
            outstring += "image_list?&amp;page=1&amp;item_per_page=" + \
                              str(item_per_page) + "&amp;keyword=" + str(session.get('image_keyword'))
            outstring += "'><<</a> "
            page_num = int(page) - 1
            outstring += "<a href='"
            outstring += "image_list?&amp;page=" + str(page_num) + \
                              "&amp;item_per_page=" + str(item_per_page) + \
                              "&amp;keyword=" + str(session.get('image_keyword'))
            outstring += "'>Previous</a> "
        span = 10
        for index in range(int(page)-span, int(page)+span):
            if index >= 0 and index < totalpage:
                page_now = index + 1 
                if page_now == int(page):
                    outstring += "<font size='+1' color='red'>" + str(page) + " </font>"
                else:
                    outstring += "<a href='"
                    outstring += "image_list?&amp;page=" + str(page_now) + \
                                      "&amp;item_per_page=" + str(item_per_page) + \
                                      "&amp;keyword=" + str(session.get('image_keyword'))
                    outstring += "'>" + str(page_now) + "</a> "

        if notlast == True:
            nextpage = int(page) + 1
            outstring += " <a href='"
            outstring += "image_list?&amp;page=" + str(nextpage) + \
                              "&amp;item_per_page=" + str(item_per_page) + \
                              "&amp;keyword=" + str(session.get('image_keyword'))
            outstring += "'>Next</a>"
            outstring += " <a href='"
            outstring += "image_list?&amp;page=" + str(totalpage) + \
                              "&amp;item_per_page=" + str(item_per_page) + \
                              "&amp;keyword=" + str(session.get('image_keyword'))
            outstring += "'>>></a><br /><br />"
        if (int(page) * int(item_per_page)) < total_rows:
            notlast = True
            outstring += imagelist_access_list(files, starti, endi) + "<br />"
        else:
            outstring += "<br /><br />"
            outstring += imagelist_access_list(files, starti, total_rows) + "<br />"
        
        if int(page) > 1:
            outstring += "<a href='"
            outstring += "image_list?&amp;page=1&amp;item_per_page=" + \
                              str(item_per_page) + "&amp;keyword=" + str(session.get('image_keyword'))
            outstring += "'><<</a> "
            page_num = int(page) - 1
            outstring += "<a href='"
            outstring += "image_list?&amp;page=" + str(page_num) + \
                              "&amp;item_per_page=" + str(item_per_page) + \
                              "&amp;keyword=" + str(session.get('image_keyword'))
            outstring += "'>Previous</a> "
        span = 10
        for index in range(int(page)-span, int(page)+span):
            if index >=0 and index < totalpage:
                page_now = index + 1
                if page_now == int(page):
                    outstring += "<font size='+1' color='red'>" + str(page) + " </font>"
                else:
                    outstring += "<a href='"
                    outstring += "image_list?&amp;page=" + str(page_now) + \
                                      "&amp;item_per_page=" + str(item_per_page) + \
                                      "&amp;keyword=" + str(session.get('image_keyword'))
                    outstring += "'>"+str(page_now) + "</a> "
        if notlast == True:
            nextpage = int(page) + 1
            outstring += " <a href='"
            outstring += "image_list?&amp;page=" + str(nextpage) + \
                              "&amp;item_per_page=" + str(item_per_page) + \
                              "&amp;keyword=" + str(session.get('image_keyword'))
            outstring += "'>Next</a>"
            outstring += " <a href='"
            outstring += "image_list?&amp;page=" + str(totalpage) + \
                              "&amp;item_per_page=" + str(item_per_page) + \
                              "&amp;keyword=" + str(session.get('image_keyword'))
            outstring += "'>>></a>"
    else:
        outstring += "no data!"
    outstring += "<br /><br /><input type='submit' value='delete'><input type='reset' value='reset'></form>"

    head, level, page = parse_content()
    directory = render_menu(head, level, page)

    return set_css() + "<div class='container'><nav>"+ \
             directory + "</nav><section><h1>Image List</h1>" + \
             outstring + "<br/><br /></body></html>"


@app.route('/imageaxupload', methods=['POST'])
# ajax jquery chunked file upload for flask
def imageaxupload():
    if isAdmin():
        # need to consider if the uploaded filename already existed.
        # right now all existed files will be replaced with the new files
        filename = request.args.get("ax-file-name")
        flag = request.args.get("start")
        if flag == "0":
            file = open(_curdir + "/images/" + filename, "wb")
        else:
            file = open(_curdir + "/images/" + filename, "ab")
        file.write(request.stream.read())
        file.close()
        return "image files uploaded!"
    else:
        return redirect("/login")


def imagelist_access_list(files, starti, endi):
    # different extension files, associated links were provided
    # popup window to view images, video or STL files, other files can be downloaded directly
    # files are all the data to list, from starti to endi
    # add file size
    outstring = ""
    for index in range(int(starti)-1, int(endi)):
        fileName, fileExtension = os.path.splitext(files[index])
        fileExtension = fileExtension.lower()
        fileSize = sizeof_fmt(os.path.getsize(image_dir + "/" + files[index]))
        # images files
        if fileExtension == ".png" or fileExtension == ".jpg" or fileExtension == ".gif":
            outstring += '<input type="checkbox" name="filename" value="' + files[index] + \
                              '"><a href="javascript:;" onClick="window.open(\'/images/' + \
                              files[index] + '\',\'images\', \'catalogmode\',\'scrollbars\')">' + \
                              files[index] + '</a> (' + str(fileSize) + ')<br />'
    return outstring


# 與 file_selector 搭配的取影像檔程式
def imageselect_access_list(files, starti, endi):
    outstring = '''<head>
<style>
a.xhfbfile {padding: 0 2px 0 0; line-height: 1em;}
a.xhfbfile img{border: none; margin: 6px;}
a.xhfbfile span{display: none;}
a.xhfbfile:hover span{
    display: block;
    position: relative;
    left: 150px;
    border: #aaa 1px solid;
    padding: 2px;
    background-color: #ddd;
}
a.xhfbfile:hover{
    background-color: #ccc;
    opacity: .9;
    cursor:pointer;
}
</style>
</head>
'''
    for index in range(int(starti)-1, int(endi)):
        fileName, fileExtension = os.path.splitext(files[index])
        fileSize = os.path.getsize(image_dir+"/"+files[index])
        outstring += '''<a class="xhfbfile" href="#" onclick='window.setLink("/images/'''+ \
                          files[index] + '''",0); return false;'>''' + \
                          files[index] + '''<span style="position: absolute; z-index: 4;"><br /> \
                          <img src="/images/''' + files[index] + '''" width="150px"/></span></a> \
                          (''' + str(sizeof_fmt(fileSize)) + ''')<br />'''
    return outstring


@app.route('/imageuploadform', defaults={'edit': 1})
@app.route('/imageuploadform/<path:edit>')
def imageuploadform(edit):
    """image files upload form"""
    if isAdmin():
        head, level, page = parse_content()
        directory = render_menu(head, level, page)
        return set_css() + "<div class='container'><nav>" + \
                 directory + "</nav><section><h1>image files upload</h1>" + '''
<script src="/static/jquery.js" type="text/javascript"></script>
<script src="/static/axuploader.js" type="text/javascript"></script>
<script>
$(document).ready(function(){
$('.prova').axuploader({url:'imageaxupload', allowExt:['jpg','png','gif'],
finish:function(x,files)
    {
        alert('All files have been uploaded: '+files);
    },
enable:true,
remotePath:function(){
return 'images/';
}
});
});
</script>
<div class="prova"></div>
<input type="button" onclick="$('.prova').axuploader('disable')" value="asd" />
<input type="button" onclick="$('.prova').axuploader('enable')" value="ok" />
</section></body></html>
'''
    else:
        return redirect("/login")


@app.route('/')
def index():
    head, level, page = parse_content()
    # 2018.12.13, 將空白轉為"+" 號, 會導致連線錯誤, 改為直接取頁面標題
    #return redirect("/get_page/" + urllib.parse.quote_plus(head[0], encoding="utf-8"))
    return redirect("/get_page/" + head[0])
    # the following will never execute
    directory = render_menu(head, level, page)
    if heading is None:
        heading = head[0]
    # 因為同一 heading 可能有多頁, 因此不可使用 head.index(heading) 搜尋 page_order
    page_order_list, page_content_list = search_content(head, page, heading)
    return_content = ""
    for i in range(len(page_order_list)):
        #page_order = head.index(heading)
        page_order = page_order_list[page_order_list[i]]
        if page_order == 0:
            last_page = ""
        else:
            last_page = head[page_order-1] + " << <a href='/get_page/" + \
                             head[page_order-1] + "'>Previous</a>"
        if page_order == len(head) - 1:
            # no next page
            next_page = ""
        else:
            next_page = "<a href='/get_page/" + head[page_order+1] + \
                              "'>Next</a> >> " + head[page_order+1]
        return_content += last_page + " " + next_page + "<br /><h1>" + \
                                  heading + "</h1>" + page_content_list[page_order_list[i]] + \
                                  "<br />" + last_page + " " + next_page

    return set_css() + "<div class='container'><nav>" + \
             directory + "</nav><section>" + return_content + "</section></div></body></html>"


def isAdmin():
    if session.get('admin') == 1:
            return True
    else:
        return False


# use to check directory variable data
@app.route('/listdir')
def listdir():
    return download_dir + "," + config_dir


@app.route('/load_list')
def load_list(item_per_page=5, page=1, filedir=None, keyword=None):
    files = os.listdir(config_dir+filedir+"_programs/")
    if keyword is None:
        pass
    else:
        session['search_keyword'] = keyword
        files = [s for s in files if keyword in s]
    total_rows = len(files)
    totalpage = math.ceil(total_rows/int(item_per_page))
    starti = int(item_per_page) * (int(page) - 1) + 1
    endi = starti + int(item_per_page) - 1
    outstring = '''<script>
function keywordSearch(){
    var oform = document.forms["searchform"];
    // 取elements集合中 name 屬性為 keyword 的值
    var getKeyword = oform.elements.keyword.value;
    // 改為若表單為空, 則列出全部資料
    //if(getKeyword != ""){
        window.location = "?brython&keyword="+getKeyword;
    //}
}
</script>
    <form name="searchform">
    <input type="text" id="keyword" />
    <input type="button" id="send" value="查詢" onClick="keywordSearch()"/> 
    </form>
'''
    outstring += "<form name='filelist' method='post' action=''>"
    notlast = False
    if total_rows > 0:
        # turn off the page selector on top
        '''
        outstring += "<br />"
        if (int(page) * int(item_per_page)) < total_rows:
            notlast = True
        if int(page) > 1:
            outstring += "<a href='"
            outstring += "brython?&amp;page=1&amp;item_per_page="+str(item_per_page)+"&amp;keyword="+str(session.get('search_keyword'))
            outstring += "'>{{</a> "
            page_num = int(page) - 1
            outstring += "<a href='"
            outstring += "brython?&amp;page="+str(page_num)+"&amp;item_per_page="+str(item_per_page)+"&amp;keyword="+str(session.get('search_keyword'))
            outstring += "'>Previous</a> "
        span = 10
        for index in range(int(page)-span, int(page)+span):
            if index>= 0 and index< totalpage:
                page_now = index + 1 
                if page_now == int(page):
                    outstring += "<font size='+1' color='red'>"+str(page)+" </font>"
                else:
                    outstring += "<a href='"
                    outstring += "brython?&amp;page="+str(page_now)+"&amp;item_per_page="+str(item_per_page)+"&amp;keyword="+str(session.get('search_keyword'))
                    outstring += "'>"+str(page_now)+"</a> "

        if notlast == True:
            nextpage = int(page) + 1
            outstring += " <a href='"
            outstring += "brython?&amp;page="+str(nextpage)+"&amp;item_per_page="+str(item_per_page)+"&amp;keyword="+str(session.get('search_keyword'))
            outstring += "'>Next</a>"
            outstring += " <a href='"
            outstring += "brython?&amp;page="+str(totalpage)+"&amp;item_per_page="+str(item_per_page)+"&amp;keyword="+str(session.get('search_keyword'))
            outstring += "'>}}</a><br /><br />"
        '''
        if (int(page) * int(item_per_page)) < total_rows:
            notlast = True
            outstring += loadlist_access_list(files, starti, endi, filedir) + "<br />"
        else:
            outstring += "<br /><br />"
            outstring += loadlist_access_list(files, starti, total_rows, filedir) + "<br />"
        
        if int(page) > 1:
            outstring += "<a href='"
            outstring += "/"+filedir + "?&amp;page=1&amp;item_per_page=" + str(item_per_page)+"&amp;keyword=" + str(session.get('search_keyword'))
            outstring += "'>{{</a> "
            page_num = int(page) - 1
            outstring += "<a href='"
            outstring += "/"+filedir + "?&amp;page=" + str(page_num)+"&amp;item_per_page=" + \
                              str(item_per_page) + "&amp;keyword=" + str(session.get('search_keyword'))
            outstring += "'>Previous</a> "
        span = 5
        for index in range(int(page)-span, int(page)+span):
        #for ($j=$page-$range;$j<$page+$range;$j++)
            if index >=0 and index < totalpage:
                page_now = index + 1
                if page_now == int(page):
                    outstring += "<font size='+1' color='red'>" + str(page) + " </font>"
                else:
                    outstring += "<a href='"
                    outstring += "/" + filedir + "?&amp;page=" + str(page_now) + \
                                      "&amp;item_per_page=" + str(item_per_page) + \
                                      "&amp;keyword="+str(session.get('search_keyword'))
                    outstring += "'>" + str(page_now) + "</a> "
        if notlast == True:
            nextpage = int(page) + 1
            outstring += " <a href='"
            outstring += "/" + filedir + "?&amp;page=" + str(nextpage) + \
                              "&amp;item_per_page=" + str(item_per_page) + \
                              "&amp;keyword=" + str(session.get('search_keyword'))
            outstring += "'>Next</a>"
            outstring += " <a href='"
            outstring += "/" + filedir + "?&amp;page=" + str(totalpage) + \
                              "&amp;item_per_page=" + str(item_per_page) + \
                              "&amp;keyword=" + str(session.get('search_keyword'))
            outstring += "'>}}</a>"
    else:
        outstring += "no data!"
    #outstring += "<br /><br /><input type='submit' value='load'><input type='reset' value='reset'></form>"
    outstring += "<br /><br /></form>"

    return outstring


def loadlist_access_list(files, starti, endi, filedir):
    # different extension files, associated links were provided
    # popup window to view images, video or STL files, other files can be downloaded directly
    # files are all the data to list, from starti to endi
    # add file size
    outstring = ""
    for index in range(int(starti)-1, int(endi)):
        fileName, fileExtension = os.path.splitext(files[index])
        fileExtension = fileExtension.lower()
        fileSize = sizeof_fmt(os.path.getsize(config_dir + filedir + "_programs/" + files[index]))
        # images files
        if fileExtension == ".png" or fileExtension == ".jpg" or fileExtension == ".gif":
            outstring += '<input type="checkbox" name="filename" value="' + files[index] + \
                              '"><a href="javascript:;" onClick="window.open(\'/downloads/'+ \
                            files[index] + '\',\'images\', \'catalogmode\',\'scrollbars\')">' + files[index] + '</a> (' + str(fileSize)+')<br />'
        # stl files
        elif fileExtension == ".stl":
            outstring += '<input type="checkbox" name="filename" value="' + files[index] + '"><a href="javascript:;" onClick="window.open(\'/static/viewstl.html?src=/downloads/' + \
            files[index] + '\',\'images\', \'catalogmode\',\'scrollbars\')">' + files[index] + '</a> ('+str(fileSize)+')<br />'
        # flv files
        elif fileExtension == ".flv":
            outstring += '<input type="checkbox" name="filename" value="' + files[index] + '"><a href="javascript:;" onClick="window.open(\'/flvplayer?filepath=/downloads/' + \
            files[index]+'\',\'images\', \'catalogmode\',\'scrollbars\')">' + files[index] + '</a> ('+str(fileSize)+')<br />'
        # py files
        elif fileExtension == ".py":
            outstring += '<input type="radio" name="filename" value="' + files[index] + '">' + files[index] + ' (' + str(fileSize) + ')<br />'
        # direct download files
        else:
            outstring += "<input type='checkbox' name='filename' value='" + files[index] + \
                             "'><a href='/" + filedir + "_programs/" + files[index] + "'>" + files[index] + "</a> (" + str(fileSize) + ")<br />"
    return outstring


@app.route('/login')
def login():
    """login routine"""
    head, level, page = parse_content()
    directory = render_menu(head, level, page)
    if not isAdmin():
        return set_css() + "<div class='container'><nav>" + \
                 directory + "</nav><section><h1>Login</h1><form method='post' action='checkLogin'> \
                Password:<input type='password' name='password'> \
    <input type='submit' value='login'></form> \
    </section></div></body></html>"
    else:
        return redirect('/edit_page')


@app.route('/logout')
def logout():
    session.pop('admin' , None)
    flash('已經登出!')
    return redirect(url_for('login'))


def parse_config():
    if not os.path.isfile(config_dir+"config"):
        # create config file if there is no config file
        # default password is admin
        password="admin"
        hashed_password = hashlib.sha512(password.encode('utf-8')).hexdigest()
        with open(config_dir + "config", "w", encoding="utf-8") as f:
            f.write("siteTitle:CMSimfly \npassword:"+hashed_password)
    config = file_get_contents(config_dir + "config")
    config_data = config.split("\n")
    site_title = config_data[0].split(":")[1]
    password = config_data[1].split(":")[1]
    return site_title, password


def _remove_h123_attrs(soup):
    tag_order = 0
    for tag in soup.find_all(['h1', 'h2', 'h3']):
        # 假如標註內容沒有字串
        #if len(tag.text) == 0:
        if len(tag.contents) ==0:
            # 且該標註為排序第一
            if tag_order == 0:
                tag.string = "First"
            else:
                # 若該標註非排序第一, 則移除無內容的標題標註
                tag.extract()
        # 針對單一元件的標題標註
        elif len(tag.contents) == 1:
            # 若內容非為純文字, 表示內容為其他標註物件
            if tag.get_text() == "":
                # 且該標註為排序第一
                if tag_order == 0:
                    # 在最前方插入標題
                    tag.insert_before(soup.new_tag('h1', 'First'))
                else:
                    # 移除 h1, h2 或 h3 標註, 只留下內容
                    tag.replaceWithChildren()
            # 表示單一元件的標題標註, 且標題為單一字串者
            else:
                # 判定若其排序第一, 則將 tag.name 為 h2 或 h3 者換為 h1
                if tag_order == 0:
                    tag.name = "h1"
            # 針對其餘單一字串內容的標註, 則保持原樣
        # 針對內容一個以上的標題標註
        #elif len(tag.contents) > 1:
        else:
            # 假如該標註內容長度大於 1
            # 且該標註為排序第一
            if tag_order == 0:
                # 先移除 h1, h2 或 h3 標註, 只留下內容
                #tag.replaceWithChildren()
                # 在最前方插入標題
                tag.insert_before(soup.new_tag('h1', 'First'))
            else:
                # 只保留標題內容,  去除 h1, h2 或 h3 標註
                # 為了與前面的內文區隔, 先在最前面插入 br 標註
                tag.insert_before(soup.new_tag('br'))
                # 再移除非排序第一的 h1, h2 或 h3 標註, 只留下內容
                tag.replaceWithChildren()
        tag_order = tag_order + 1

    return soup

def parse_content():
    """use bs4 and re module functions to parse content.htm"""
    #from pybean import Store, SQLiteWriter
    # if no content.db, create database file with cms table
    '''
    if not os.path.isfile(config_dir+"content.db"):
        library = Store(SQLiteWriter(config_dir+"content.db", frozen=False))
        cms = library.new("cms")
        cms.follow = 0
        cms.title = "head 1"
        cms.content = "content 1"
        cms.memo = "first memo"
        library.save(cms)
        library.commit()
    '''
    # if no content.htm, generate a head 1 and content 1 file
    if not os.path.isfile(config_dir+"content.htm"):
        # create content.htm if there is no content.htm
        with open(config_dir + "content.htm", "w", encoding="utf-8") as f:
            f.write("<h1>head 1</h1>content 1")
    subject = file_get_contents(config_dir+"content.htm")
    # deal with content without content
    if subject == "":
        # create content.htm if there is no content.htm
        with open(config_dir + "content.htm", "w", encoding="utf-8") as f:
            f.write("<h1>head 1</h1>content 1")
        subject = "<h1>head 1</h1>content 1"
    # initialize the return lists
    head_list = []
    level_list = []
    page_list = []
    # make the soup out of the html content
    soup = bs4.BeautifulSoup(subject, 'html.parser')
    # 嘗試解讀各種情況下的標題
    soup = _remove_h123_attrs(soup)
    # 改寫 content.htm 後重新取 subject
    with open(config_dir + "content.htm", "wb") as f:
        f.write(soup.encode("utf-8"))
    subject = file_get_contents(config_dir+"content.htm")
    # get all h1, h2, h3 tags into list
    htag= soup.find_all(['h1', 'h2', 'h3'])
    n = len(htag)
    # get the page content to split subject using each h tag
    temp_data = subject.split(str(htag[0]))
    if len(temp_data) > 2:
        subject = str(htag[0]).join(temp_data[1:])
    else:
        subject = temp_data[1]
    if n >1:
            # i from 1 to i-1
            for i in range(1, len(htag)):
                head_list.append(htag[i-1].text.strip())
                # use name attribute of h* tag to get h1, h2 or h3
                # the number of h1, h2 or h3 is the level of page menu
                level_list.append(htag[i-1].name[1])
                temp_data = subject.split(str(htag[i]))
                if len(temp_data) > 2:
                    subject = str(htag[i]).join(temp_data[1:])
                else:
                    subject = temp_data[1]
                # cut the other page content out of htag from 1 to i-1
                cut = temp_data[0]
                # add the page content
                page_list.append(cut)
    # last i
    # add the last page title
    head_list.append(htag[n-1].text.strip())
    # add the last level
    level_list.append(htag[n-1].name[1])
    temp_data = subject.split(str(htag[n-1]))
    # the last subject
    subject = temp_data[0]
    # cut the last page content out
    cut = temp_data[0]
    # the last page content
    page_list.append(cut)
    return head_list, level_list, page_list

def render_menu(head, level, page, sitemap=0):
    '''允許使用者在 h1 標題後直接加上 h3 標題, 或者隨後納入 h4 之後作為標題標註'''
    directory = ""
    # 從 level 數列第一個元素作為開端
    current_level = level[0]
    # 若是 sitemap 則僅列出樹狀架構而沒有套用 css3menu 架構
    if sitemap:
        directory += "<ul>"
    else:
        directory += "<ul id='css3menu1' class='topmenu'>"
    # 逐一配合 level 數列中的各標題階次, 一一建立對應的表單或 sitemap
    for index in range(len(head)):
        # 用 this_level 取出迴圈中逐一處理的頁面對應層級, 注意取出值為 str
        this_level = level[index]
        # 若處理中的層級比上一層級高超過一層, 則將處理層級升級 (處理 h1 後直接接 h3 情況)
        if (int(this_level) - int(current_level)) > 1:
            #this_level = str(int(this_level) - 1)
            # 考慮若納入 h4 也作為標題標註, 相鄰層級可能大於一層, 因此直接用上一層級 + 1
            this_level = str(int(current_level) + 1)
        # 若處理的階次比目前已經處理的階次大, 表示位階較低
        # 其實當 level[0] 完全不會報告此一區塊
        # 從正在處理的標題階次與前一個元素比對, 若階次低, 則要加入另一區段的 unordered list 標頭
        # 兩者皆為 str 會轉為整數後比較
        if this_level > current_level:
            directory += "<ul>"
            directory += "<li><a href='/get_page/" + head[index] + "'>" + head[index] + "</a>"
        # 假如正在處理的標題與前一個元素同位階, 則必須再判定是否為另一個 h1 的樹狀頭
        elif this_level == current_level:
            # 若正在處理的標題確實為樹狀頭, 則標上樹狀頭開始標註
            if this_level == 1:
                # 這裡還是需要判定是在建立 sitemap 模式或者選單模式
                if sitemap:
                    directory += "<li><a href='/get_page/" + head[index] + "'>" + head[index]+"</a>"
                else:
                    directory += "<li class='topmenu'><a href='/get_page/" + head[index] + "'>" + head[index] + "</a>"
            #  假如不是樹狀頭, 則只列出對應的 list
            else:
                directory += "<li><a href='/get_page/" + head[index] + "'>" + head[index] + "</a>"
        # 假如正處理的元素比上一個元素位階更高, 必須要先關掉前面的低位階區段
        else:
            directory += "</li>"*(int(current_level) - int(level[index]))
            directory += "</ul>"*(int(current_level) - int(level[index]))
            if this_level == 1:
                if sitemap:
                    directory += "<li><a href='/get_page/" + head[index] + "'>" + head[index] + "</a>"
                else:
                    directory += "<li class='topmenu'><a href='/get_page/" + head[index] + "'>" + head[index] + "</a>"
            else:
                directory += "<li><a href='/get_page/" + head[index] + "'>" + head[index] + "</a>"
        current_level = this_level
    directory += "</li></ul>"
    return directory
def render_menu2(head, level, page, sitemap=0):
    """render menu for static site"""
    directory = ""
    current_level = level[0]
    if sitemap:
        directory += "<ul>"
    else:
        # before add tipue search function
        #directory += "<ul id='css3menu1' class='topmenu'>"
        directory += "<ul id='css3menu1' class='topmenu'><div class=\"tipue_search_group\"><input style=\"width: 6vw;\" type=\"text\" name=\"q\" id=\"tipue_search_input\" pattern=\".{2,}\" title=\"Press enter key to search\" required></div>"
    for index in range(len(head)):
        this_level = level[index]
        # 若處理中的層級比上一層級高超過一層, 則將處理層級升級 (處理 h1 後直接接 h3 情況)
        if (int(this_level) - int(current_level)) > 1:
            #this_level = str(int(this_level) - 1)
            this_level = str(int(current_level) + 1)
        if this_level > current_level:
            directory += "<ul>"
            #directory += "<li><a href='/get_page/"+head[index]+"'>"+head[index]+"</a>"
            # 改為連結到 content/標題.html
            directory += "<li><a href='" + head[index] + ".html'>" + head[index] + "</a>"
        elif this_level == current_level:
            if this_level == 1:
                if sitemap:
                    # 改為連結到 content/標題.html
                    #directory += "<li><a href='/get_page/"+head[index]+"'>"+head[index]+"</a>"
                    directory += "<li><a href='" + head[index] + ".html'>" + head[index] + "</a>"
                else:
                    #directory += "<li class='topmenu'><a href='/get_page/"+head[index]+"'>"+head[index]+"</a>"
                    directory += "<li class='topmenu'><a href='content/" + head[index] + ".html'>" + head[index] + "</a>"
            else:
                #directory += "<li><a href='/get_page/"+head[index]+"'>"+head[index]+"</a>"
                directory += "<li><a href='" + head[index] + ".html'>" + head[index] + "</a>"
        else:
            directory += "</li>"*(int(current_level) - int(level[index]))
            directory += "</ul>"*(int(current_level) - int(level[index]))
            if this_level == 1:
                if sitemap:
                    #directory += "<li><a href='/get_page/"+head[index]+"'>"+head[index]+"</a>"
                    directory += "<li><a href='" + head[index] + ".html'>" + head[index] + "</a>"
                else:
                    #directory += "<li class='topmenu'><a href='/get_page/"+head[index]+"'>"+head[index]+"</a>"
                    directory += "<li class='topmenu'><a href='" + head[index] + ".html'>" + head[index] + "</a>"
            else:
                #directory += "<li><a href='/get_page/"+head[index]+"'>"+head[index]+"</a>"
                directory += "<li><a href='" + head[index] + ".html'>" + head[index] + "</a>"
        current_level = this_level
    directory += "</li></ul>"
    return directory
@app.route('/saveConfig', methods=['POST'])
def saveConfig():
    if not isAdmin():
        return redirect("/login")
    site_title = request.form['site_title']
    password = request.form['password']
    password2 = request.form['password2']
    if site_title is None or password is None:
        return error_log("no content to save!")
    old_site_title, old_password = parse_config()
    head, level, page = parse_content()
    directory = render_menu(head, level, page)
    if site_title is None or password is None or password2 != old_password or password == '':
        return set_css() + "<div class='container'><nav>" + \
                directory + "</nav><section><h1>Error!</h1><a href='/'>Home</a></body></html>"
    else:
        if password == password2 and password == old_password:
            hashed_password = old_password
        else:
            hashed_password = hashlib.sha512(password.encode('utf-8')).hexdigest()
        file = open(config_dir + "config", "w", encoding="utf-8")
        file.write("siteTitle:" + site_title + "\npassword:" + hashed_password)
        file.close()
        return set_css() + "<div class='container'><nav>" + \
                 directory + "</nav><section><h1>config file saved</h1><a href='/'>Home</a></body></html>"


@app.route('/savePage', methods=['POST'])
def savePage():
    """save all pages function"""
    page_content = request.form['page_content']
    # check if administrator
    if not isAdmin():
        return redirect("/login")
    if page_content is None:
        return error_log("no content to save!")
    # 在插入新頁面資料前, 先複製 content.htm 一分到 content_backup.htm
    shutil.copy2(config_dir + "content.htm", config_dir + "content_backup.htm")
    # in Windows client operator, to avoid textarea add extra \n
    page_content = page_content.replace("\n","")
    with open(config_dir + "content.htm", "w", encoding="utf-8") as f:
        f.write(page_content)
    return redirect("/edit_page")


# use head title to search page content
'''
# search_content(head, page, search)
# 從 head 與 page 數列中, 以 search 關鍵字進行查詢
# 原先傳回與 search 關鍵字頁面對應的頁面內容
# 現在則傳回多重的頁面次序與頁面內容數列
find = lambda searchList, elem: [[i for i, x in enumerate(searchList) if x == e] for e in elem]
head = ["標題一","標題二","標題三","標題一","標題四","標題五"]
search_result = find(head,["標題一"])[0]
page_order = []
page_content = []
for i in range(len(search_result)):
    # 印出次序
    page_order.append(search_result[i])
    # 標題為 head[search_result[i]]
    #  頁面內容則為 page[search_result[i]]
    page_content.append(page[search_result[i]])
    # 從 page[次序] 印出頁面內容
# 準備傳回 page_order 與 page_content 等兩個數列
'''


def search_content(head, page, search):
    """search content"""
    ''' 舊內容
    return page[head.index(search)]
    '''
    find = lambda searchList, elem: [[i for i, x in enumerate(searchList) if x == e] for e in elem]
    search_result = find(head, [search])[0]
    page_order = []
    page_content = []
    for i in range(len(search_result)):
        # 印出次序
        page_order.append(search_result[i])
        # 標題為 head[search_result[i]]
        #  頁面內容則為 page[search_result[i]]
        page_content.append(page[search_result[i]])
        # 從 page[次序] 印出頁面內容
    # 準備傳回 page_order 與 page_content 等兩個數列
    return page_order, page_content


@app.route('/search_form', defaults={'edit': 1})
@app.route('/search_form/<path:edit>')
def search_form(edit):
    """form of keyword search"""
    if isAdmin():
        head, level, page = parse_content()
        directory = render_menu(head, level, page)
        return set_css() + "<div class='container'><nav>" + \
                 directory + "</nav><section><h1>Search</h1> \
                 <form method='post' action='doSearch'> \
                 keywords:<input type='text' name='keyword'> \
                 <input type='submit' value='search'></form> \
                 </section></div></body></html>"
    else:
        return redirect("/login")


# setup static directory
@app.route('/static/<path:path>')
def send_file(path):
    """send file function"""
    return app.send_static_file(static_dir + path)


# setup static directory
#@app.route('/images/<path:path>')
@app.route('/images/<path:path>')
def send_images(path):
    """send image files"""
    return send_from_directory(_curdir + "/images/", path)


# setup static directory
@app.route('/static/')
def send_static():
    """send static files"""
    return app.send_static_file('index.html')


# set_admin_css for administrator
def set_admin_css():
    """set css for admin"""
    outstring = '''<!doctype html>
<html><head>
<meta http-equiv="content-type" content="text/html;charset=utf-8">
<title>''' + init.Init.site_title + '''</title> \
<link rel="stylesheet" type="text/css" href="/static/cmsimply.css">
''' + syntaxhighlight()

    outstring += '''
<script src="/static/jquery.js"></script>
<script type="text/javascript">
$(function(){
    $("ul.topmenu> li:has(ul) > a").append('<div class="arrow-right"></div>');
    $("ul.topmenu > li ul li:has(ul) > a").append('<div class="arrow-right"></div>');
});
</script>
'''
    # SSL for uwsgi operation
    if uwsgi:
        outstring += '''
<script type="text/javascript">
if ((location.href.search(/http:/) != -1) && (location.href.search(/login/) != -1)) \
window.location= 'https://' + location.host + location.pathname + location.search;
</script>
'''
    site_title, password = parse_config()
    outstring += '''
</head><header><h1>''' + site_title + '''</h1> \
<confmenu>
<ul>
<li><a href="/">Home</a></li>
<li><a href="/sitemap">SiteMap</a></li>
<li><a href="/edit_page">Edit All</a></li>
<li><a href="''' + str(request.url) + '''/1">Edit</a></li>
<li><a href="/edit_config">Config</a></li>
<li><a href="/search_form">Search</a></li>
<li><a href="/imageuploadform">Image Upload</a></li>
<li><a href="/image_list">Image List</a></li>
<li><a href="/fileuploadform">File Upload</a></li>
<li><a href="/download_list">File List</a></li>
<li><a href="/logout">Logout</a></li>
<li><a href="/generate_pages">generate_pages</a></li>
'''
    outstring += '''
</ul>
</confmenu></header>
'''
    return outstring


def set_css():
    """set css for dynamic site"""
    outstring = '''<!doctype html>
<html><head>
<meta http-equiv="content-type" content="text/html;charset=utf-8">
<title>''' + init.Init.site_title + '''</title> \
<link rel="stylesheet" type="text/css" href="/static/cmsimply.css">
''' + syntaxhighlight()

    outstring += '''
<script src="/static/jquery.js"></script>
<script type="text/javascript">
$(function(){
    $("ul.topmenu> li:has(ul) > a").append('<div class="arrow-right"></div>');
    $("ul.topmenu > li ul li:has(ul) > a").append('<div class="arrow-right"></div>');
});
</script>
'''
    if uwsgi:
        outstring += '''
<script type="text/javascript">
if ((location.href.search(/http:/) != -1) && (location.href.search(/login/) != -1)) \
window.location= 'https://' + location.host + location.pathname + location.search;
</script>
'''
    site_title, password = parse_config()
    outstring += '''
</head><header><h1>''' + site_title + '''</h1> \
<confmenu>
<ul>
<li><a href="/">Home</a></li>
<li><a href="/sitemap">Site Map</a></li>
'''
    if isAdmin():
        outstring += '''
<li><a href="/edit_page">Edit All</a></li>
<li><a href="''' + str(request.url) + '''/1">Edit</a></li>
<li><a href="/edit_config">Config</a></li>
<li><a href="/search_form">Search</a></li>
<li><a href="/imageuploadform">image upload</a></li>
<li><a href="/image_list">image list</a></li>
<li><a href="/fileuploadform">file upload</a></li>
<li><a href="/download_list">file list</a></li>
<li><a href="/logout">logout</a></li>
<li><a href="/generate_pages">generate_pages</a></li>
'''
    else:
        outstring += '''
<li><a href="/login">login</a></li>
'''
    outstring += '''
</ul>
</confmenu></header>
'''
    return outstring


def set_css2():
    """set css for static site"""
    outstring = '''<!doctype html>
<html><head>
<meta http-equiv="content-type" content="text/html;charset=utf-8">
<title>''' + init.Init.site_title + '''</title> \
<link rel="stylesheet" type="text/css" href="./../static/cmsimply.css">
<script src="tipuesearch_content.js"></script>
<script src="./../static/jquery.js"></script>
<link rel="stylesheet" href="./../static/tipuesearch/css/tipuesearch.css">
<script src="./../static/tipuesearch/tipuesearch_set.js"></script>
<script src="./../static/tipuesearch/tipuesearch.min.js"></script>
''' + syntaxhighlight2()

    outstring += '''
<script type="text/javascript">
/*shorthand of $(document).ready(function(){};); */
$(function(){
    $("ul.topmenu> li:has(ul) > a").append('<div class="arrow-right"></div>');
    $("ul.topmenu > li ul li:has(ul) > a").append('<div class="arrow-right"></div>');
});
function doSearch() {
     $('#tipue_search_input').tipuesearch({
        newWindow: true, minimumLength: 2
     });
}
$(document).ready(doSearch);
</script>
'''
    if uwsgi:
        outstring += '''
<script type="text/javascript">
if ((location.href.search(/http:/) != -1) && (location.href.search(/login/) != -1)) \
window.location= 'https://' + location.host + location.pathname + location.search;
</script>
'''
    site_title, password = parse_config()
    outstring += '''
</head><header><h1>''' + site_title + '''</h1> \
<confmenu>
<ul>
<li><a href="index.html">Home</a></li>
<li><a href="sitemap.html">Site Map</a></li>
<li><a href="./../reveal/index.html">reveal</a></li>
<li><a href="./../blog/index.html">blog</a></li>
'''
    outstring += '''
</ul>
</confmenu></header>
'''
    return outstring


def set_footer():
    """footer for page"""
    return "<footer> \
        <a href='/edit_page'>Edit All</a>| \
        <a href='" + str(request.url) + "/1'>Edit</a>| \
        <a href='edit_config'>Config</a> \
        <a href='login'>login</a>| \
        <a href='logout'>logout</a> \
        <br />Powered by <a href='http://cmsimple.cycu.org'>CMSimply</a> \
        </footer> \
        </body></html>"
@app.route('/sitemap', defaults={'edit': 1})
@app.route('/sitemap/<path:edit>')
def sitemap(edit):
    """sitemap for dynamic site"""
    head, level, page = parse_content()
    directory = render_menu(head, level, page)
    sitemap = render_menu(head, level, page, sitemap=1)
    return set_css() + "<div class='container'><nav>" + directory + \
             "</nav><section><h1>Site Map</h1>" + sitemap + \
             "</section></div></body></html>"
def sitemap2(head):
    """sitemap for static content generation"""
    edit = 0
    not_used_head, level, page = parse_content()
    directory = render_menu2(head, level, page)
    sitemap = render_menu2(head, level, page, sitemap=1)
    # add tipue search id
    return set_css2() + "<div class='container'><nav>" + directory + \
             "</nav><section><h1>Site Map</h1><div id=\"tipue_search_content\"></div>" + sitemap + \
             "</section></div></body></html>"


def sizeof_fmt(num):
    """size formate"""
    for x in ['bytes','KB','MB','GB']:
        if num < 1024.0:
            return "%3.1f%s" % (num, x)
        num /= 1024.0
    return "%3.1f%s" % (num, 'TB')
@app.route('/ssavePage', methods=['POST'])
def ssavePage():
    """seperate save page function"""
    page_content = request.form['page_content']
    page_order = request.form['page_order']
    if not isAdmin():
        return redirect("/login")
    if page_content is None:
        return error_log("no content to save!")
    # 請注意, 若啟用 fullpage plugin 這裡的 page_content tinymce4 會自動加上 html 頭尾標註
    page_content = page_content.replace("\n","")
    head, level, page = parse_content()
    original_head_title = head[int(page_order)]
    # 在插入新頁面資料前, 先複製 content.htm 一分到 content_backup.htm
    shutil.copy2(config_dir + "content.htm", config_dir + "content_backup.htm")
    file = open(config_dir + "content.htm", "w", encoding="utf-8")
    for index in range(len(head)):
        if index == int(page_order):
            file.write(page_content)
        else:
            file.write("<h"+str(level[index])+ ">" + str(head[index]) + "</h" + \
                          str(level[index])+">"+str(page[index]))
    file.close()
    # if every ssavePage generate_pages needed
    #generate_pages()

    # if head[int(page_order)] still existed and equal original_head_title, go back to origin edit status, otherwise go to "/"
    # here the content is modified, we need to parse the new page_content again
    head, level, page = parse_content()
    # for debug
    # print(original_head_title, head[int(page_order)])
    # 嘗試避免因最後一個標題刪除儲存後產生 internal error 問題
    if original_head_title is None:
        return redirect("/")
    if original_head_title == head[int(page_order)]:
        #edit_url = "/get_page/" + urllib.parse.quote_plus(head[int(page_order)]) + "&edit=1"
        #edit_url = "/get_page/" + urllib.parse.quote_plus(original_head_title) + "/1"
        edit_url = "/get_page/" + original_head_title + "/1"
        return redirect(edit_url)
    else:
        return redirect("/")


def syntaxhighlight():
    return '''
<script type="text/javascript" src="/static/syntaxhighlighter/shCore.js"></script>
<script type="text/javascript" src="/static/syntaxhighlighter/shBrushJScript.js"></script>
<script type="text/javascript" src="/static/syntaxhighlighter/shBrushJava.js"></script>
<script type="text/javascript" src="/static/syntaxhighlighter/shBrushPython.js"></script>
<script type="text/javascript" src="/static/syntaxhighlighter/shBrushSql.js"></script>
<script type="text/javascript" src="/static/syntaxhighlighter/shBrushXml.js"></script>
<script type="text/javascript" src="/static/syntaxhighlighter/shBrushPhp.js"></script>
<script type="text/javascript" src="/static/syntaxhighlighter/shBrushLua.js"></script>
<script type="text/javascript" src="/static/syntaxhighlighter/shBrushCpp.js"></script>
<script type="text/javascript" src="/static/syntaxhighlighter/shBrushCss.js"></script>
<script type="text/javascript" src="/static/syntaxhighlighter/shBrushCSharp.js"></script>
<link type="text/css" rel="stylesheet" href="/static/syntaxhighlighter/css/shCoreDefault.css"/>
<script type="text/javascript">SyntaxHighlighter.all();</script>

<!-- for LaTeX equations 暫時不用
    <script src="https://scrum-3.github.io/web/math/MathJax.js?config=TeX-MML-AM_CHTML" type="text/javascript"></script>
    <script type="text/javascript">
    init_mathjax = function() {
        if (window.MathJax) {
            // MathJax loaded
            MathJax.Hub.Config({
                tex2jax: {
                    inlineMath: [ ['$','$'], ["\\\\(","\\\\)"] ],
                    displayMath: [ ['$$','$$'], ["\\\\[","\\\\]"] ]
                },
                displayAlign: 'left', // Change this to 'center' to center equations.
                "HTML-CSS": {
                    styles: {'.MathJax_Display': {"margin": 0}}
                }
            });
            MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
        }
    }
    init_mathjax();
    </script>
 -->
 <!-- 暫時不用
<script src="/static/fengari-web.js"></script>
<script type="text/javascript" src="/static/Cango-13v08-min.js"></script>
<script type="text/javascript" src="/static/CangoAxes-4v01-min.js"></script>
<script type="text/javascript" src="/static/gearUtils-05.js"></script>
-->
<!-- for Brython 暫時不用
<script src="https://scrum-3.github.io/web/brython/brython.js"></script>
<script src="https://scrum-3.github.io/web/brython/brython_stdlib.js"></script>
-->
'''



def syntaxhighlight2():
    return '''
<script type="text/javascript" src="./../static/syntaxhighlighter/shCore.js"></script>
<script type="text/javascript" src="./../static/syntaxhighlighter/shBrushJScript.js"></script>
<script type="text/javascript" src="./../static/syntaxhighlighter/shBrushJava.js"></script>
<script type="text/javascript" src="./../static/syntaxhighlighter/shBrushPython.js"></script>
<script type="text/javascript" src="./../static/syntaxhighlighter/shBrushSql.js"></script>
<script type="text/javascript" src="./../static/syntaxhighlighter/shBrushXml.js"></script>
<script type="text/javascript" src="./../static/syntaxhighlighter/shBrushPhp.js"></script>
<script type="text/javascript" src="./../static/syntaxhighlighter/shBrushLua.js"></script>
<script type="text/javascript" src="./../static/syntaxhighlighter/shBrushCpp.js"></script>
<script type="text/javascript" src="./../static/syntaxhighlighter/shBrushCss.js"></script>
<script type="text/javascript" src="./../static/syntaxhighlighter/shBrushCSharp.js"></script>
<link type="text/css" rel="stylesheet" href="./../static/syntaxhighlighter/css/shCoreDefault.css"/>
<script type="text/javascript">SyntaxHighlighter.all();</script>

<!-- for LaTeX equations 暫時不用
<script src="https://scrum-3.github.io/web/math/MathJax.js?config=TeX-MML-AM_CHTML" type="text/javascript"></script>
<script type="text/javascript">
init_mathjax = function() {
    if (window.MathJax) {
        // MathJax loaded
        MathJax.Hub.Config({
            tex2jax: {
                inlineMath: [ ['$','$'], ["\\\\(","\\\\)"] ],
                displayMath: [ ['$$','$$'], ["\\\\[","\\\\]"] ]
            },
            displayAlign: 'left', // Change this to 'center' to center equations.
            "HTML-CSS": {
                styles: {'.MathJax_Display': {"margin": 0}}
            }
        });
        MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
    }
}
init_mathjax();
</script>
-->
<!-- 暫時不用
<script src="./../static/fengari-web.js"></script>
<script type="text/javascript" src="./../static/Cango-13v08-min.js"></script>
<script type="text/javascript" src="./../static/CangoAxes-4v01-min.js"></script>
<script type="text/javascript" src="./../static/gearUtils-05.js"></script>
-->
<!-- for Brython 暫時不用
<script src="https://scrum-3.github.io/web/brython/brython.js"></script>
<script src="https://scrum-3.github.io/web/brython/brython_stdlib.js"></script>
-->
'''


def tinymce_editor(menu_input=None, editor_content=None, page_order=None):
    sitecontent =file_get_contents(config_dir + "content.htm")
    editor = set_admin_css() + editorhead() + '''</head>''' + editorfoot()
    # edit all pages
    if page_order is None:
        outstring = editor + "<div class='container'><nav>" + \
                        menu_input + "</nav><section><form method='post' action='savePage'> \
                        <textarea class='simply-editor' name='page_content' cols='50' rows='15'>" +  \
                        editor_content + "</textarea><input type='submit' value='save'> \
                        </form></section></body></html>"
    else:
        # add viewpage button wilie single page editing
        head, level, page = parse_content()
        outstring = editor + "<div class='container'><nav>" + \
                        menu_input+"</nav><section><form method='post' action='/ssavePage'> \
                        <textarea class='simply-editor' name='page_content' cols='50' rows='15'>" + \
                        editor_content + "</textarea><input type='hidden' name='page_order' value='" + \
                        str(page_order) + "'><input type='submit' value='save'>"
        outstring += '''<input type=button onClick="location.href='/get_page/''' + \
                    head[page_order] + \
                    ''''" value='viewpage'></form></section></body></html>'''
    return outstring


def unique(items):
    """make items element unique"""
    found = set([])
    keep = []
    count = {}
    for item in items:
        if item not in found:
            count[item] = 0
            found.add(item)
            keep.append(item)
        else:
            count[item] += 1
            keep.append(str(item) + "_" + str(count[item]))
    return keep


if __name__ == "__main__":
    app.run()
