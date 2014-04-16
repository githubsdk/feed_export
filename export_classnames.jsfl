/************************************************
导出指定文件夹下的所有.xfl和.fla文件的库中
设置了链接类名的元件信息
格式：ElementName=元件名 Type=[元件类型]  LinkName=[链接类名]
导出位置 ： var configFile = "file:///C|/Documents and Settings/Administrator/Desktop/export_classnames.txt"; 
*************************************************/

//资源停到的帧 
var _stopFrame = 3;
//模板名字
var templeteName = "templete.fla";
//模板文件完整路径
var templeteFullPath = null;
//之前文件夹的名字
var oldFoldername = null;
//当前文件夹的名字
var folderName = null;
//资源需要的帧
var iFrame = 0;
//资源需要的元件名字
var elemName = null;
//标记
var frameFlag = "templete_";
//源文件
var sourceDom = null;
//v当前路径
var currentPath = null;
//当前文件名，带后缀
var currentFileName = null;
 
f();
function f()
{
        var folder = fl.browseForFolderURL("选择要导出的文件夹");
        if (! folder)
        {
                return;
        }
        var paths = getAllFiles(folder);
        if (confirm("将要批量导出" + paths.length + "个文件"))
        {
                publish(paths);
        }
}
//打开模板文件
function openTemplete()
{
	var target = fl.openDocument(templeteFullPath);
	var lib = target.library;
	lib.editItem("empty");
	target.clipPaste();
	var savepath = currentPath.replace(currentFileName, "") + currentFileName.replace(".fla", ".png");
	fl.trace(savepath);
	target.exportPNG(savepath, true);
	fl.closeDocument(target, true);
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
        fl.trace("开始批量发布");
		
		for each (var path in paths)
        {
				//跳过模板
				if(path.search(templeteName)>=0)
				{
					templeteFullPath = path;
					break
				}
		}
		
        for each (var path in paths)
        {
				//跳过模板
				if(path.search(templeteName)>=0)
				{
					continue;
				}
				setFlags(path);
				//打开资源
				sourceDom = fl.openDocument(path);				
				currentPath = path;
				currentFileName = sourceDom.name;
				 var lib = sourceDom.library
				 /*
				for each(var d in lib.items)
				{
					if(d.linkageClassName!=elemName)
						continue;
					lib.selectItem(elemName);
					 fl.trace(sourceDom.selection[0]);
				}
				*/
				sourceDom.library.selectNone()
				var b = lib.selectItem(elemName);
				lib.addItemToDocument({x:0,y:0}, elemName);
				sourceDom.selectAll();
				//fl.trace(elemName + "_" + b + " _ " + sourceDom) ;
				sourceDom.clipCopy();
				
				openTemplete();
				
				fl.closeDocument(sourceDom, false);
        }
        fl.trace("完成发布");
}


//获取元件名和帧数
function setFlags(path)
{
	var parts = path.split("/");
	var name = parts[parts.length-2];
	parts = name.split("_");
	elemName = parts[0];
	iFrame = parts[1];
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