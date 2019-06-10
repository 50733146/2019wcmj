STLViewer = function(stlpath, plotarea) {

	var mycanvas = document.getElementById(plotarea);
	var viewer = new JSC3D.Viewer(mycanvas)
	var theScene = new JSC3D.Scene;
	////Initialize with a default file:
	//var stlpath = "../../../assets/2013-10-23/stl/box.STL"
	//var stlpath = "../../../assets/2013-10-23/stl/taj.stl"
	viewer.setParameter('SceneUrl', stlpath);
    viewer.setParameter('InitRotationX', 20);
	viewer.setParameter('InitRotationY', 20);
	viewer.setParameter('InitRotationZ', 0);
	viewer.setParameter('ModelColor', '#CAA618');
	viewer.setParameter('BackgroundColor1', '#FFFFFF');
	viewer.setParameter('BackgroundColor2', '#383840');
	viewer.init();
	viewer.update();
	////init done
	var canvas_drop = document.getElementById('canvas-drop')
	/*var dropzone = document.getElementById('dropzone')
	dropzone.addEventListener('dragover', handleDragOver, false);
	dropzone.addEventListener('drop', handleFileSelect, false); */
	canvas_drop.addEventListener('dragover', handleDragOver, false);
	canvas_drop.addEventListener('drop', handleFileSelect, false);

////Drag and drop logic:
	function handleFileSelect(evt) {
	    evt.stopPropagation();
	    evt.preventDefault();
	    var files = evt.dataTransfer.files;
	    console.log(evt)
	    console.log(files)
	    preview_stl(files[0])
	  }

	  function handleDragOver(evt) {
	    evt.stopPropagation();
	    evt.preventDefault();
	    evt.dataTransfer.dropEffect = 'copy';
	  }

////jsc3d logic
	var handle_file_select = function(e) {
		e.stopPropagation()
		e.preventDefault()
		var f = e.target.files[0]
		preview_stl(f)
	}

	function preview_stl(f) {
		var reader = new FileReader()
		var ext = f.name.split(".")[1]

		function setup_viewer() {
			viewer.setParameter('InitRotationX', 20);
			viewer.setParameter('InitRotationY', 20);
			viewer.setParameter('InitRotationZ', 0);
			viewer.setParameter('ModelColor', '#CAA618');
			viewer.setParameter('BackgroundColor1', '#FFFFFF');
			viewer.setParameter('BackgroundColor2', '#383840');
			viewer.setParameter('RenderMode', "flat");
		}
		setup_viewer()

		reader.onload = (function(file) {
			return function(e) {
				theScene = new JSC3D.Scene
		    	stl_loader = new JSC3D.StlLoader()
		    	stl_loader.parseStl(theScene, e.target.result)
		      	//viewer.init()
		      	viewer.replaceScene(theScene)
		      	viewer.update()
		      	console.log("file reader onload")
			}
		})(f)

		if (ext.toLowerCase() != "stl") {
			alert("That doesn't appear to be an STL file.");
		} else {
			reader.readAsBinaryString(f)
		}
	}
}
