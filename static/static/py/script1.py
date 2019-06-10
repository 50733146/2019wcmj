import sys
import time
import traceback
import javascript

from browser import document as doc, window, alert

has_ace = True
try:
    editor = window.ace.edit("editor")
    session = editor.getSession()
    session.setMode("ace/mode/python")

    editor.setOptions({
     'enableLiveAutocompletion': True,
     'enableSnippets': True,
     'highlightActiveLine': False,
     'highlightSelectedWord': True,
     'autoScrollEditorIntoView': True,
     # 'maxLines': session.getLength() 可以根據程式長度設定 editor 列數
     'maxLines': 20
    })
except:
    from browser import html
    editor = html.TEXTAREA(rows=20, cols=70)
    doc["editor"] <= editor
    def get_value(): return editor.value
    def set_value(x):editor.value = x
    editor.getValue = get_value
    editor.setValue = set_value
    has_ace = False

if hasattr(window, 'localStorage'):
    from browser.local_storage import storage
else:
    storage = None

def reset_src():
    if storage is not None and "py_src" in storage:
        editor.setValue(storage["py_src"])
    else:
        editor.setValue('for i in range(10):\n\tprint(i)')
    editor.scrollToRow(0)
    editor.gotoLine(0)

def reset_src_area():
    if storage and "py_src" in storage:
        editor.value = storage["py_src"]
    else:
        editor.value = 'for i in range(10):\n\tprint(i)'

class cOutput:

    def __init__(self,target):
        self.target = doc[target]
    def write(self,data):
        self.target.value += str(data)
        

#if "console" in doc:
sys.stdout = cOutput("console")
sys.stderr = cOutput("console")

def to_str(xx):
    return str(xx)

info = sys.implementation.version
doc['version'].text = 'Brython %s.%s.%s' % (info.major, info.minor, info.micro)

output = ''

def show_console(ev):
    doc["console"].value = output
    doc["console"].cols = 60
    doc["console"].rows = 10

# load a Python script
def load_script(evt):
    _name = evt.target.value + '?foo=%s' % time.time()
    editor.setValue(open(_name).read())

# run a script, in global namespace if in_globals is True
def run(*args):
    global output
    doc["console"].value = ''
    src = editor.getValue()
    if storage is not None:
       storage["py_src"] = src

    t0 = time.perf_counter()
    try:
        #ns = {'__name__':'__main__'}
        ns = {'__name__':'editor'}
        exec(src, ns)
        state = 1
    except Exception as exc:
        traceback.print_exc(file=sys.stderr)
        state = 0
    output = doc["console"].value

    print('<completed in %6.2f ms>' % ((time.perf_counter() - t0) * 1000.0))
    return state

if has_ace:
    reset_src()
else:
    reset_src_area()
    
def clear_console(ev):
    doc["console"].value = ""

doc['run'].bind('click',run)
doc['show_console'].bind('click',show_console)
doc['clear_console'].bind('click',clear_console)
