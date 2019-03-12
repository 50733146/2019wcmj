import sys
import time
import traceback
import javascript

from browser import document as doc, window, alert

if hasattr(window, 'localStorage'):
    from browser.local_storage import storage
else:
    storage = None

class cOutput:

    def __init__(self, target):
        self.target = doc[target]

    def write(self, data):
        self.target.value += str(data)

class Editor():
    
    def __init__(self, editor_id, console_id, container_id, storage_id):
        self.editor_id = editor_id
        self.console_id = console_id
        self.container_id = container_id
        self.storage_id = storage_id
        self.output = ''

        try:
            self.editor = window.ace.edit(self.editor_id)
            session = self.editor.getSession()
            session.setMode("ace/mode/python")

            self.editor.setOptions({
             'enableLiveAutocompletion': True,
             'enableSnippets': True,
             'highlightActiveLine': False,
             'highlightSelectedWord': True,
             'autoScrollEditorIntoView': True,
             # 'maxLines': session.getLength() 可以根據程式長度設定 editor 列數
             # 設定讓使用者最多可以在畫面中顯示 20 行程式碼
             'maxLines': 20,
             'fontSize': '12pt'
            })
        except:
            from browser import html
            self.editor = html.TEXTAREA(rows=20, cols=70)
            doc[self.editor_id] <= self.editor
            def get_value(): return self.editor.value
            def set_value(x): self.editor.value = x
            self.editor.getValue = get_value
            self.editor.setValue = set_value
            
    def run(self, *args):
        sys.stdout = cOutput(self.console_id)
        sys.stderr = cOutput(self.console_id)
        doc[self.console_id].value = ''
        src = self.editor.getValue()
        if storage is not None:
           storage[self.storage_id] = src

        t0 = time.perf_counter()
        try:
            #ns = {'__name__':'__main__'}
            # 以 self.editor_id 名稱執行程式
            ns = {'__name__': self.editor_id}
            exec(src, ns)
            state = 1
        except Exception as exc:
            traceback.print_exc(file=sys.stderr)
            state = 0
        self.output = doc[self.console_id].value

        print('<completed in %6.2f ms>' % ((time.perf_counter() - t0) * 1000.0))
        return state

    def show_console(self, ev):
        doc[self.console_id].value = self.output
        doc[self.console_id].cols = 60
        doc[self.console_id].rows = 10
        
    def clear_console(self, ev):
        doc[self.console_id].value = ""
        
    def clear_container(self, ev):
        doc[self.container_id].clear()

    # load a Python script
    def load_script(self, evt):
        _name = evt.target.value + '?foo=%s' % time.time()
        self.editor.setValue(open(_name).read())

