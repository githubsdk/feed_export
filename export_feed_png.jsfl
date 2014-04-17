/************************************************

*************************************************/

//资源停到的帧 
var _stopFrame = 3;
//文件名
var NAME = "muban";
//模板名字
var suffix = ".fla";
var templeteName = NAME+suffix;
//模板文件完整路径
var templeteFullPath = null;
//资源需要的帧
var iFrame = 0;
//资源需要的元件名字
var elemName = null;
//源文件
var sourceDom = null;
//v当前路径
var currentPath = null;
//当前文件名，不带后缀
var currentFileName = null;
//导出文件夹
var destPath = null;
//记录导出的文件名
var allPNG = "";
 
f();
function f()
{
        var folder = fl.browseForFolderURL("选择资源文件夹");
        if (! folder)
        {
                return;
        }
		destPath = fl.browseForFolderURL("选择导出目标文件夹");
        if (! destPath)
        {
                return;
        }
		trace(destPath);
        var paths = getAllFiles(folder);
        if (confirm("将要批量导出" + paths.length + "个文件"))
        {
                publish(paths);
        }
}
//导出
function exportPNG()
{
	var target = fl.openDocument(templeteFullPath);
	var lib = target.library;
	lib.editItem("empty");
	lib.selectItem("empty");
	var tl = lib.getSelectedItems()[0].timeline;
	//alert(tl.frameCount);
	//trace(tl.frameCount)
	tl.pasteFrames(0);
	//target.clipPaste(true);
	target.exitEditMode();
	var path = currentPath.replace(currentFileName, "");
	var savepath = FLfile.uriToPlatformPath(destPath) +"\\"+ currentFileName.replace(".fla", "");
	alert(savepath)
	
	//修改导出配置
	var profile = target.exportPublishProfileString();
	var pngname = currentFileName.replace(".fla", ".png");
	//profile.PublishFormatProperties.pngFileName = pngname
	
	
	profile = profile.replace("<defaultNames>1</defaultNames>", "<defaultNames>0</defaultNames>");
	profile = profile.replace("<pngDefaultName>1</pngDefaultName>", "<pngDefaultName>0</pngDefaultName>");
	profile = profile.replace("<pngFileName>"+NAME+"</pngFileName>", "<pngFileName>11"+pngname+"</pngFileName>");
	/*
	while(profile.indexOf(NAME)!=-1)
	{
		profile = profile.replace(NAME, savepath);
	}
	*/
	
	
	target.importPublishProfileString(profile);
	//trace(target.exportPublishProfileString());
	target.publish(savepath, true);
	allPNG = allPNG + "\n" + savepath;
	//target.exportPNG(savepath, true);
	fl.closeDocument(target, false);
	return profile;
}

//从路径名分离出元件名和需要的帧
function spliceNameAndFrame(path)
{
	var parts = path.split("/");
	var name = parts[parts.length-2];
	parts = name.split("_");
	elemName = parts[0];
	iFrame = parts[1];
}

//设置模板文件路径
function buildTempletePath(path, fileName)
{
	trace(path + fileName);
	templeteFullPath = path.replace(fileName, templeteName);
	
}


function publish(paths)
{
        if (paths.length > 20)
        {
                if (! confirm("文件比较多(" + paths.length + ")个,是否继续?"))
                {
                        return;
                }
        }
        fl.outputPanel.clear();
        trace("开始批量发布");
		
		/*
		for each (var path in paths)
        {
				//跳过模板
				if(path.search(templeteName)>=0)
				{
					templeteFullPath = path;
					break
				}
		}
		*/
		
        for each (var path in paths)
        {
			
				//跳过模板
				if(path.search(templeteName)>=0)
				{
					continue;
				}
				
				spliceNameAndFrame(path);
				//打开资源
				sourceDom = fl.openDocument(path);				
				buildTempletePath(path, sourceDom.name);
				currentPath = path;
				currentFileName = sourceDom.name;
				 var lib = sourceDom.library
				 
				
				
				sourceDom.library.selectNone()
				var b = lib.selectItem(elemName);
				//针对命名不规范的，使用遍历查找类名
				if(b==false)
				{
					for each(var d in lib.items)
					{
						trace(d.linkageClassName + "_" + d.name)
						if(d.linkageClassName!=elemName)
							continue;
						elemName = d.name;
						lib.selectItem(elemName);
						
						 break;
					}
				}
				// trace(lib.getSelectedItems()[0]+b+elemName);
				var b = lib.editItem(elemName);
				trace(b)
				var tl = lib.getSelectedItems()[0].timeline;
				//选择包含有效资源的图层
				for(var i=0; i < tl.layers.length; ++i)
				{
					var layer = tl.layers[i];
					if(layer.frameCount==iFrame&&layer.layerType!="guided")
					{
						tl.currentLayer = i;
						break;
					}
				}
				
				tl.copyFrames(iFrame-1);
				tl.pasteFrames(0);
				//sourceDom.clipCopy();
				
				var e = exportPNG();
				//trace(e);
				
				fl.closeDocument(sourceDom, false);
        }
       trace(allPNG);
}

function trace(string)
{
	fl.trace(string);
}

function getFiles(folder, type)
{
        return FLfile.listFolder(folder+"/*."+type,"files");
}
function getFolders(folder)
{
        return FLfile.listFolder(folder+"/*","directories");
}
function getAllFiles(folder)
{
        //递归得到文件夹内所有as文件
        var list = getFiles(folder, "fla").concat(getFiles(folder, "xfl"));
        var i = 0;
        for each (var file in list)
        {
                list[i] = folder + "/" + file;
                i++;
        }
        var folders = getFolders(folder);
        for each (var childFolder in folders)
        {
                list = list.concat(getAllFiles(folder + "/" + childFolder));
        }
        return list;
}