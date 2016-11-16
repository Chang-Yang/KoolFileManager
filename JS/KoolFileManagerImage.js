(function() {	
	KoolFileManager = {};

	KoolFileManager.create = function(id, target, jsVars, width, height) {
		if (typeof window.FileReader === 'undefined' || typeof window.FormData === 'undefined' || typeof window.Blob === 'undefined') {
			alert("Unsupported Web Browser");
			return false;
		}

		if (isNull(width))
			width = "100%";

		if (isNull(height))
			height = "100%";

		// finding the target <DIV> in which the upload components are displayed
		if (!target) {
			document.write("<div id='___temp4KoolFileManager' style='width:0px; height:0px; display:none'/>");
			domReady(function () {				
				var targetDiv = document.getElementById("___temp4KoolFileManager").parentNode;
				target = targetDiv.id;
				targetDiv.removeChild(document.getElementById("___temp4KoolFileManager"));
				targetDiv = null;
				doInitialize();
			});
		} else { // If the target <DIV> is undefined
			if (isNull(target))
				throw "target is undefined for KoolFileManager";
			
			domReady(doInitialize);
		}

		function doInitialize() {
			if (!document.getElementById(target))
				throw "target is undefined for KoolFileManager";

			var key,
				keyArr = [],
				item,
				value,
				keyIdx,
				dataObj,
				layoutXml,
				valuesMap = {},
				valuesArr = (jsVars == undefined) ? [] : jsVars.split('&');

			for (var i=0, n=valuesArr.length; i<n; i++) {
				item = valuesArr[i];
				keyIdx = item.indexOf("=");
				key = item.substring(0, keyIdx);
				value = item.substring(keyIdx+1, item.length);
				valuesMap[key] = (value.toLowerCase() === "true") ? true : ((value.toLowerCase() === "false") ? false : value);
				keyArr.push(key);
			}
			if (valuesMap) {
				initializeUploader(valuesMap,keyArr);
				var rootDiv = createUpload(id, target, width, height);
			}

			var called = callOnLoadCallFunction();

			function callOnLoadCallFunction() {
				try {
					if (!isNull(valuesMap["KoolOnLoadCallFunction"])) {
						if (isFunction(valuesMap["KoolOnLoadCallFunction"])) {
							valuesMap["KoolOnLoadCallFunction"](id);
						} else if (isString(valuesMap["KoolOnLoadCallFunction"])) {
							CallBackHelper.findFunction(valuesMap["KoolOnLoadCallFunction"])(id);
						}
						return true;
					}
					return false;
				} catch(e) {
					throw e.toString();
				};
			};

			function initializeUploader(valuesMap,keyArr) {
				_uploader = new Uploader();
				var i;
				for (i = 0 ; i < keyArr.length ; i++) {
					if (_uploader[keyArr[i]] != undefined ) {				// saving the variables in _uploader					
						if (!isNaN2(Number(valuesMap[keyArr[i]]))) {		// checking if it is a Numeric value
							_uploader[keyArr[i]] = Number(valuesMap[keyArr[i]]);							
						} else {
							_uploader[keyArr[i]] = valuesMap[keyArr[i]];							
						}
					} else {
						trace(keyArr[i]+" is not found");
					}
				}
			}

			// creating Uploader
			function createUpload(id, target, width, height) {
				// creating the root <DIV>
				var targetDiv = document.getElementById(target);
				var rootDiv = Utils.createElement("div", elementClassName + "Root"),
					getStyle = Utils.getStyle,
					setStyle = Utils.setStyle;
				rootDiv.id = id;
				rootDiv.style.overflow = KoolFileManager.overflow ? "hidden" : "visible";
				_uploader.rootDiv = rootDiv;

				var divValue;
				var p;
				var pw;
				var rootDivWidth = 0;
				var rootDivHeight = 0;
	
				var percentExist = false;
			
				if (!isNull(width)) {
					if (/%/.test(width)) {
						// 
						// rootDivWidth = (getStyle(targetDiv, "width") * Number(width.replace(/%/, "")) * 0.01);
						// 
						divValue = getStyle(targetDiv, "width");
						rootDiv.percentWidth = width;
						if (/%/.test(divValue)) {
							p = targetDiv.parentNode;
							pw = getStyle(p,"width");
							if (isNaN2(pw) || !pw)
								pw = p.offsetWidth;
							rootDivWidth = Number(divValue.replace(/%/,"")) * pw * Number(width.replace(/%/, "")) * 0.0001;
							percentExist = true;
						} else {
							rootDivWidth = (divValue * Number(width.replace(/%/, "")) * 0.01);
						}
					} else {
						rootDivWidth = Number(width);
					}
				} else {
					rootDivWidth = KoolFileManager.defaultWidth;
				}
			
				// 
				// targetDiv.pastWidth = rootDivWidth;
				// 
				if (!isNull(height)) {
					if (/%/.test(height)) {
						// 
						// rootDivHeight = (getStyle(targetDiv, "height") * Number(height.replace(/%/, "")) * 0.01);
						// 
						divValue = getStyle(targetDiv, "height");
						rootDiv.percentHeight = height;
						if (/%/.test(divValue)) {
							p = targetDiv.parentNode;
							pw = getStyle(p,"height");
							if (isNaN2(pw) || !pw)
								pw = p.offsetHeight;
							rootDivHeight = Number(divValue.replace(/%/,"")) * pw * Number(height.replace(/%/,""))* 0.0001;
							percentExist = true;
						} else {
							rootDivHeight = (divValue * Number(height.replace(/%/, "")) * 0.01);
						}
					} else {
						rootDivHeight = Number(height);
					}
				} else {
					rootDivHeight = KoolFileManager.defaultHeight;
				}
				rootDiv.style.width = rootDivWidth + "px";
				rootDiv.style.height =  rootDivHeight + "px";
				rootDiv.orgWidth = rootDivWidth;
				rootDiv.orgHeight = rootDivHeight;
				
				targetDiv.appendChild(rootDiv);

				rootDiv.setUploadedFiles = function(uploadedFiles) {
					var a ={ "target"  : {"files":uploadedFiles},
							 "isUploaded" : true};
					_uploader.onchange(a);
				}

				rootDiv.reset = function() {
					rootDiv = null;
					initializeUploader(valuesMap,keyArr);
					rootDiv = createUpload(id, target, width, height);
				}

				rootDiv.getAddedFiles = function() {
					var arr = [];	
					for (var key in _uploader.uploadFiles) {
						arr.push(_uploader.uploadFiles[key].name);
					}
					return arr;
				}

				rootDiv.getUploadResultFiles = function() {
					return _uploader.uploadedFiles;
				}

				rootDiv.getUploadFileCount = function() {	// the number of files to be uploaded 
					_uploader.fileCount = 0;
					for (var key in _uploader.uploadFiles) {
						var file = _uploader.uploadFiles[key];						
						_uploader.fileCount++;					
					}

					return _uploader.fileCount;
				}

				rootDiv.getUploadFileSize = function() { 	// the total size of the files to be uploaded
					_uploader.bytesTotalAll = 0;
					for (var key in _uploader.uploadFiles) {
						var file = _uploader.uploadFiles[key];						
						_uploader.bytesTotalAll += file.size;
					}
					return _uploader.bytesTotalAll;
				}

				rootDiv.addFile = function(e) {
					if (CallBackHelper.findFunction(_uploader.uploaderAddButtonClickJsFunction)) {
						CallBackHelper.findFunction(_uploader.uploaderAddButtonClickJsFunction)(rootDiv.id);
					};
					_uploader.inputFile.click();
				}

				rootDiv.removeFile= function(node) { 		// deleting the selected files
					if (CallBackHelper.findFunction(_uploader.uploaderRemoveButtonClickJsFunction)) {
						CallBackHelper.findFunction(_uploader.uploaderRemoveButtonClickJsFunction)(rootDiv.id);
					};
					var remove;
					if (!node) {
						if (_uploader.selectedFiles) {
							for (var i = 0 ; i < _uploader.uploadFiles.length; i++) {
								if (_uploader.uploadFiles[i] === _uploader.selectedFiles) {
									_uploader.selectedFiles.index = i;
									_uploader.listFiles.removeChild(_uploader.uploadFiles[i].element);
									_uploader.uploadFiles.splice(i,1);
									removed=true;
								}
							}
						}							
					} else {
						for (var i = 0 ; i  < _uploader.uploadFiles.length ; i++) {
							if (node.parentNode == _uploader.uploadFiles[i].element) {
								_uploader.selectedFiles = _uploader.uploadFiles[i]; 
								_uploader.listFiles.removeChild(_uploader.uploadFiles[i].element);
								_uploader.uploadFiles.splice(i,1);
								removed=true;
								}
							}
						}
						if (_uploader.info) {
						_uploader.info.innerHTML = rootDiv.updateUploadInfoText();
					}
					if (_uploader.uploadFiles.length==0 && _uploader.btnUpload) {
						_uploader.btnUpload.disabled = true;
					}
					if (removed) {
						if (CallBackHelper.findFunction(_uploader.uploaderFileRemovedJsFunction)) {
							CallBackHelper.findFunction(_uploader.uploaderFileRemovedJsFunction)(rootDiv.id,_uploader.selectedFiles);
						};
					}
					
					var newUploader = Utils.createElement("input", elementClassName + "inputFile");
					newUploader.type = "file";
					Utils.setStyle(newUploader,"width","0px");
					Utils.setStyle(newUploader,"height","0px");
					newUploader.multiple = "multiple";
					if (_uploader.fileFilterExtension != "")
						newUploader.accept = _uploader.fileFilterExtension;
					else
						newUploader.accept = "image/*";
					
					newUploader.onchange = function(e) {
						_uploader.onchange(e);	
					}
					_uploader.uploadVBox.element.removeChild(_uploader.inputFile);
					_uploader.inputFile = newUploader;
					_uploader.uploadVBox.element.appendChild(newUploader);
					
					
					_uploader.selectedFiles = null;
					if (!isNull(_uploader.previewImg)) {
						_uploader.previewImg.src =  _uploader.previeImgSrc;
					}
				}

				rootDiv.cancelUpload = function() {
					if (CallBackHelper.findFunction(_uploader.uploadCancelJsFunction)) {
						CallBackHelper.findFunction(_uploader.uploadCancelJsFunction)(rootDiv.id);		
					};
					if (_uploader.xhr) {
						_uploader.inUpload = false;
						_uploader.xhr.abort();			
					}
					rootDiv.closeProgressPanel(rootDiv.id);
					
				}

				rootDiv.startUpload = function() {
				
					if (CallBackHelper.findFunction(_uploader.upladerUploadStartJsFunction)) {
						CallBackHelper.findFunction(_uploader.upladerUploadStartJsFunction)(rootDiv.id);		
					};

					var i,j,flength = _uploader.uploadFiles.length,
						file;

					var count = rootDiv.getUploadFileCount();
					if (count <= 0) {
						alert("No file to be found");
						return false;
					}
					_uploader.uploadedFileCount = 0;

					var sendOption = {
						length : _uploader.uploadFiles.length
					};
					var each = false;
					if (_uploader.progressMode = "full") {
						rootDiv.openProgressPanel(rootDiv.id)
					}
					
					// current upload file index
					_uploader.currentUploadFileIndex = 0;
					_uploader.totalposition = 0;
					_uploader.inUpload = true;
					startUploads();
					function startUploads() {
						var prmStr = "",file = _uploader.uploadFiles[_uploader.currentUploadFileIndex];
						if (file) {
							if (CallBackHelper.findFunction(_uploader.parameterJsFunction)) {
								var name = file.name;
								prmStr = CallBackHelper.findFunction(_uploader.parameterJsFunction)(rootDiv.id,_uploader.currentUploadFileIndex,name,file.size);
							};
						} else {
							if (_uploader.progressMode =="full") {
								rootDiv.closeProgressPanel(rootDiv.id);
							}									
							if (_uploader.uploadGetData) {
								if(CallBackHelper.findFunction(_uploader.uploadCompleteDataJsFunction)){
									CallBackHelper.findFunction(_uploader.uploadCompleteDataJsFunction)(rootDiv.id);
								};
							} else {
								if (CallBackHelper.findFunction(_uploader.uploadCompleteJsFunction)) {
									CallBackHelper.findFunction(_uploader.uploadCompleteJsFunction)(rootDiv.id);
								};
							}
							return false;
						}
						if (each) {							
							var element = file.element,
								parent = element.parentNode;
							var w = Utils.getStyle(element,"width");
							w = w *0.3;
							Utils.setStyle(element,"width",w+"px");
							var progressElement = rootDiv.openProgressPanelEach(rootDiv.id,file,_uploader.currentUploadFileIndex);
						}

						xhr = ajax({
							type : "POST",
							url : decodeURIComponent(_uploader.uploadUrl)+"?"+prmStr,
							onSuccess : function(data,sendData) {								
								var genId = "";
								if (_uploader.generateFileID) {
										genId =  sendData.generateFileID;
								}
								var successData = {
									name : sendData.name,
									size : sendData.size,
									fileid : genId,
									result : data									
								};
								_uploader.uploadedFiles.push(successData);
								
								if (_uploader.fileCount == _uploader.currentUploadFileIndex) {
									if (_uploader.progressMode =="full") {
										rootDiv.closeProgressPanel(rootDiv.id);
									}									
									if (_uploader.uploadGetData) {
										if (CallBackHelper.findFunction(_uploader.uploadCompleteDataJsFunction)) {
											CallBackHelper.findFunction(_uploader.uploadCompleteDataJsFunction)(rootDiv.id);
										};
									} else {
										if (CallBackHelper.findFunction(_uploader.uploadCompleteJsFunction)) {
											CallBackHelper.findFunction(_uploader.uploadCompleteJsFunction)(rootDiv.id);
										};
									}
								} else {
									_uploader.currentUploadFileIndex++;
									startUploads();
								}

							},//onSuccess
							loadstart : function(e) {
							},
							loadendend : function(e) {
								
							},
							load : function(e) {								
							},
							onCancel : function() {
							},
							onError : function(status) {
								if (CallBackHelper.findFunction(_uploader.uploadIOErrorJsFunction)) {
									CallBackHelper.findFunction(_uploader.uploadIOErrorJsFunction)(rootDiv.id,status);
								};
								rootDiv.closeProgressPanel(rootDiv.id);
								//throw "XMLHttpRequest is failed to open the url, " + _uploader.uploadUrl;
							},
							sendData : file,
							sendOption : sendOption,
							progress : function(e,sendOption) {
								var position = e.position || e.loaded;
								var total = e.totalSize || e.total;
								var endposition = _uploader.bytesLoadedAll+total;
								var op,od ;
								if (e.data.position) {
									op = e.data.position;
								}
								if (e.data.date) {
									od = e.data.date;
								}

								e.data.date = new Date();
								e.data.position = position;
								
								var per = ((position/total)*100).toFixed(2);
								var perStr = per +"% ";
								if (per>=100) {
									per = 100;
								}
								var us = (position - op);
								var ud = (e.data.date - od)/1000;
								if (ud==0) {
									ud = 0.0001;
								}
								var speedBps = (us/ud).toFixed(2);
								var speedKbps = (speedBps/1024).toFixed(2);
								var speedMbps = (speedKbps/1024).toFixed(2);
								
								var speed ;
								if (!isNaN2(us)) {
									speed = speedMbps;
									speed = speed +"Mbps";
								}

								if (!speed) {
									speed = "";
								}
								var i,sum = 0;
								var index = 0;
								for (i = 0 ; i < _uploader.currentUploadFileIndex ; i++) {
									if (_uploader.uploadFiles[i].position) {
										var p = _uploader.uploadFiles[i].position;
								
										sum += p;
									}
									
									if (_uploader.uploadFiles[i]== e.data) {
										index = i;
									}
								}

								var totalPer = sum/_uploader.bytesTotalAll;
								
								var totalPerStr = (totalPer*100).toFixed(2) ;
								if (totalPerStr>100.00) {
									totalPerStr = 100;
								}
								var allPerStr = totalPerStr+"% "+_uploader.uploadedFileCount+"/"+e.sendOption.length;
								if (_uploader.progressMode =="full") {
									rootDiv.uploadProgress(rootDiv.id,position,total,sum,_uploader.bytesTotalAll,perStr,allPerStr,speed);
								} else if (_uploader.progressMode =="other") {
									//uploaderID, bytesLoaded, bytesTotal, bytesLoadedAll, bytesTotalAll, fileText, allText, speedText
									if (CallBackHelper.findFunction(_uploader.uploaderProgressJsFunction)){								
										CallBackHelper.findFunction(_uploader.uploaderProgressJsFunction)(rootDiv.id,position,total,sum,_uploader.bytesTotalAll,perStr,allPerStr,"Speed");
									};
								} else if (_uploader.progressMode =="each") {
									rootDiv.uploadProgressEach(rootDiv.id,position,total,perStr,index);
								}
							}	//progress							
						});		//ajax
						_uploader.xhr = xhr;
					}
				}				//rootDiv.startUpload = function(){

				// 0.0 KB/1000 MB (0/5) 
				rootDiv.updateUploadInfoText = function() {
					var fileSize = rootDiv.getUploadFileSize()/1024/1024;
					var strLabel = fileSize.toFixed(2) + "MB";

					if (_uploader.maxUploadSize != 0) {
						strLabel += "/" + _uploader.maxUploadSize + " MB";
					}
					
					strLabel += " (" + rootDiv.getUploadFileCount();
					if (_uploader.maxFileCount != 0) {
						strLabel += "/"+_uploader.maxFileCount;
					}
					strLabel += ")";
					
					return strLabel;
					
				}

				rootDiv.uploadAbort = function(xhr) {
					xhr.abort();
				}

				rootDiv.openProgressPanel = function(uploaderID) {
					var setStyle = Utils.setStyle,
						getStyle = Utils.getStyle;

					var w = getStyle(rootDiv,"width"),
						h = getStyle(rootDiv,"height");
					
					
					var progressPanel = Utils.createElement("div","KoolFileManagerProgressPanel");
					if (h > 150) {
						th = h - 150;
						h = 150;
						setStyle(progressPanel,"top",th*0.5+"px");
					}
					progressPanel.id = "KoolFileManagerProgressPanel"+uploaderID;
					setStyle(progressPanel,"width",w+"px");
					setStyle(progressPanel,"height",h+"px");
					
					progressPanel.innerHTML = "\
						<div id='KoolFileManagerProgressBarBox"+uploaderID+"' class='KoolFileManagerProgressBarBox'>\
							<div id='KoolFileManagerProgressBar"+uploaderID+"' class='KoolFileManagerProgressBar'>\
								<div id='KoolFileManagerProgressBarTxt"+uploaderID+"' class='KoolFileManagerProgressBarTxt'>0%</div>\
							</div>\
							<div id='KoolFileManagerProgressBarBoxTxt"+uploaderID+"' class='KoolFileManagerProgressBarBoxTxt'>0%</div>\
						</div>\
						<div id='KoolFileManagerProgressBarBox2"+uploaderID+"' class='KoolFileManagerProgressBarBox' style='top:20px;'>\
							<div id='KoolFileManagerProgressBar2"+uploaderID+"' class='KoolFileManagerProgressBar'>\
							<div id='KoolFileManagerProgressBarTxt2"+uploaderID+"' class='KoolFileManagerProgressBarTxt'>0%</div>\
							</div>\
							<div id='KoolFileManagerProgressBarBoxTxt2"+uploaderID+"' class='KoolFileManagerProgressBarBoxTxt'>0%</div>\
						</div>\
						<div id='KoolFileManagerProgressSpeedBox"+uploaderID+"' class='KoolFileManagerProgressSpeedBox'>\
							<div id='KoolFileManagerProgressSpeedBoxTxt"+uploaderID+"' class='KoolFileManagerProgressSpeedBoxTxt'>asd</div>\
							<div><input type='button' id='KoolFileManagerProgressCancelBtn"+uploaderID+"'></input></div>\
						</div>";
					document.getElementById(uploaderID).parentNode.appendChild(progressPanel);
					setStyle(progressPanel,"position","relative");

					var progressCancelBtn = document.getElementById("KoolFileManagerProgressCancelBtn"+uploaderID);
					if (_uploader.cancelBtnImageUrl == "") {
						progressCancelBtn.value = _uploader.cancelBtnLabel;
					} else {
						progressCancelBtn.style.background = "url('" + _uploader.cancelBtnImageUrl + "') no-repeat scroll 0 0 transparent";
						progressCancelBtn.style.backgroundSize = "100%";
					}
					addEvent(progressCancelBtn,"click", function(e){
						rootDiv.cancelUpload();
					});
					var progressBarBox = document.getElementById("KoolFileManagerProgressBarBox"+uploaderID);
					setStyle(progressBarBox,"width",w-30+"px");
					var progressBar = document.getElementById("KoolFileManagerProgressBar"+uploaderID);
					progressBar.style.width = "0px";
					var progressBarTxt = document.getElementById("KoolFileManagerProgressBarTxt"+uploaderID);
					progressBarTxt.style.width = w+"px";
					var progressBarBoxTxt = document.getElementById("KoolFileManagerProgressBarBoxTxt"+uploaderID);
					progressBarBoxTxt.style.width = w+"px";
					var progressBarBox2 = document.getElementById("KoolFileManagerProgressBarBox2"+uploaderID);
					progressBarBox2.style.width = w-30+"px";
					var progressBar2 = document.getElementById("KoolFileManagerProgressBar2"+uploaderID);
					progressBar2.style.width = "0px";
					var progressBarTxt2 = document.getElementById("KoolFileManagerProgressBarTxt2"+uploaderID);
					progressBarTxt2.style.width = w+"px";
					var progressBarBoxTxt2 = document.getElementById("KoolFileManagerProgressBarBoxTxt2"+uploaderID);
					progressBarBoxTxt2.style.width = w+"px";
					var progressBarBoxTxt2 = document.getElementById("KoolFileManagerProgressSpeedBox"+uploaderID);
					progressBarBoxTxt2.style.width = w-30+"px";
				}
												
				rootDiv.uploadProgress = function(uploaderID, bytesLoaded, bytesTotal, bytesLoadedAll, bytesTotalAll, fileText, allText, speedText) {
					var progressBarBoxTxt = document.getElementById("KoolFileManagerProgressBarBoxTxt"+uploaderID);
					progressBarBoxTxt.innerHTML = fileText;
					var progressBarTxt = document.getElementById("KoolFileManagerProgressBarTxt"+uploaderID);
					progressBarTxt.innerHTML = fileText;
					var progressBar = document.getElementById("KoolFileManagerProgressBar"+uploaderID);
					progressBar.style.width = Math.round(parseInt(progressBarTxt.style.width) * bytesLoaded / bytesTotal)-30 + "px";
					var progressBarBoxTxt2 = document.getElementById("KoolFileManagerProgressBarBoxTxt2"+uploaderID);
					progressBarBoxTxt2.innerHTML = allText;
					var progressBarTxt2 = document.getElementById("KoolFileManagerProgressBarTxt2"+uploaderID);
					progressBarTxt2.innerHTML = allText;
					var progressBar2 = document.getElementById("KoolFileManagerProgressBar2"+uploaderID);
					progressBar2.style.width = Math.round(parseInt(progressBarTxt2.style.width) * bytesLoadedAll / bytesTotalAll)-30 + "px";				
					var progressSpeedBoxTxt = document.getElementById("KoolFileManagerProgressSpeedBoxTxt"+uploaderID);
					progressSpeedBoxTxt.innerHTML = speedText;
				}		
				
				rootDiv.closeProgressPanel = function(uploaderID) {
					var progressPanel = document.getElementById("KoolFileManagerProgressPanel"+uploaderID);
					if (progressPanel) {
						document.getElementById(uploaderID).parentNode.removeChild(progressPanel);
					}					
				}
				_uploader.createChildrean(rootDiv);

				return rootDiv;
			}
		};	//function doInitialize
	};		//create
	KoolFileManager.userAgent = navigator.userAgent;
	
	KoolFileManager.testCSS = function (prop) {
	    return prop in document.documentElement.style;
	};
	
	KoolFileManager.detectIE = function() {
		var ua = window.navigator.userAgent;
		var msie = ua.indexOf('MSIE ');
		  
		if (msie > 0) {
		    // IE 10 or older => return version number
			//return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
			return true;
		}

		var trident = ua.indexOf('Trident/');
		if (trident > 0) {
		    // IE 11 => return version number
			//var rv = ua.indexOf('rv:');
			//return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
			return true;
		}

		var edge = ua.indexOf('Edge/');
		if (edge > 0) {
		    // Edge (IE 12+) => return version number
			//return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
			return true;
		}

		// other browser
		return false;
	};
	
	KoolFileManager.isIE =  KoolFileManager.detectIE();
	KoolFileManager.isOpera = !!(window.opera && window.opera.version);  											// Opera 8.0+
	KoolFileManager.isFirefox = KoolFileManager.testCSS('MozBoxSizing');											// FF 0.8+
	KoolFileManager.isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;		// At least Safari 3+: "[object HTMLElementConstructor]"
	KoolFileManager.isChrome = !KoolFileManager.isSafari && KoolFileManager.testCSS('WebkitTransform');				// Chrome 1+
	
	// checking if the touch event is used
	KoolFileManager.support_touch = ("ontouchend" in document && "ontouchstart" in document);
	
	KoolFileManager.defaultHeight = 280;
	KoolFileManager.defaultWidth = 420;


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	/*--------------------------------------------------------------------------
	 *
	 * Class 
	 *
	 *-------------------------------------------------------------------------*/

	/*--------------------------------------------------------------------------
	 *
	 * Uploader Class 
	 *
	 *-------------------------------------------------------------------------*/
	var _uploader;

	function Uploader() {
		//Style
		this.previewImage = null;
		this.uploadFileIcon = null;
		
		/*
			property
		*/
		this.cancelBtnLabel = "Cancel Uploading"; 	// upload cancel button
		this.uploadBtnLabel = "Upload"; 			// upload button label
		this.fileAddBtnLabel = "Add File"; 			// add file button
		this.fileRemoveBtnLabel = "Delete File"; 	// delete file button
		this.uploadUrl = ""; 						// upoload URL
		this.maxFileCount = 0; 						// the maximum number of files to be uploaded (if 0, unlimited)
		this.maxUploadSize = 0; 					// the maximum total size of files to be uploaded, MByte (if 0, unlimited) 
		this.maxFileSize = 0; 						// the maximum size of a file to be uploaded, MByte (if 0, unlimited)
		this.previewEnable = true; 					// whether or not to enable the preview function
		this.previewImmediately  = false; 			// whether or not to display the preview image of the file added last - the default value is false
		this.uploadGetData = true; 					// whether or not to have the server receive the uploading data - the default value is true
		this.doubleClickEnabled = false; 			// whether or not the double-click event is triggered when the user double-clicks on the selected file - the default value is false (if true, the itemDoubleClick function will be called)
		this.dragMoveEnabled  = false; 				// whether or not to have the user change the file sequence by drag and drop - the default value is false
		this.generateFileID = true; 				// whether or not to generate the ID of the file uploaded - the default value is true
		//this.fileFilterDescription  = "image"; 	// the description of the file extension
		this.fileFilterExtension  = ""; 			// the file extension of the file to be uploaded
		this.forbiddenExtensions = ""; 				// restricted file extensions for uploading
		this.showControlBox = true; 				// whether or not to display the box in which buttons and the progress text exist
		this.showUploadBtn = false; 				// whether or not to display the upload button
		this.showFileRemoveBtn = true;				// whether or not to display the delete file button
		this.showFileAddBtn = true;					// whether or not to display the add file button
		this.showPreviewBox = true;
		this.showInfo = true;						// whether or not to display the file information
		this.showHBox = true; 						// whether or not to display the preview & listFile box at the bottom
		this.fileDuplicateMessageLineLimit = 3; 	// the maximum number of the file name displayed in the Duplicate Message (0: no restiction, -1: no duplicate message, 2: default)
		this.uploadFieldName = "FileData";
		this.progressMode = "full";
		this.buttonPlacement  = "top";
		
		// JavaScript Function Name
		this.KoolOnLoadCallFunction = "";
		this.itemDoubleClickJsFunction = "itemDoubleClick";
		this.uploaderAddButtonClickJsFunction = "addButtonClick";
		this.uploaderRemoveButtonClickJsFunction = "removeButtonClick";
		this.uploaderFileAddedJsFunction = "fileAdded";
		this.uploaderFileRemovedJsFunction = "fileRemoved";
		this.uploadCompleteJsFunction = "uploadComplete";
		this.uploadCompleteDataJsFunction = "uploadCompleteData";
		this.parameterJsFunction = "paramFunction";
		this.uploadIOErrorJsFunction = "uploadIOError";
		this.uploaderProgressJsFunction = "uploadProgress";
		this.uploaderUploadClickJsFunction = "uploadButtonClick";
		this.upladerUploadStartJsFunction = "uploadStart";
		this.uploadCancelJsFunction  = "uploadCancel";
		this.uploaderListTextJsFunction = "listText";

		this.tempFiles = null;
		this.tempImage = document.createElement("img");
		this.tempReader = new FileReader();
		this.readImage;

		this.formdata = new FormData();				// the file object to be uploaded

		this.bytesTotalAll = 0;
		this.bytesLoadedAll = 0;
		this.uploadedFileCount = 0;
		this.fileCount = 0;
		
		//img src
		this.removeBtnSrc= "../Image/file_delete_icon.png";
		this.downloadBtnSrc = "../Image/download_button.png";
		this.previeImgSrc = "../Image/preview_image.png";
		this.fileRemoveBtnImageUrl = "";
		this.fileAddBtnImageUrl = "";
		this.uploadBtnImageUrl = "";
		this.cancelBtnImageUrl = "";

		//style
		this.setStyle = Utils.setStyle;
		this.getStyle = Utils.getStyle;
		this.btnPadding = 10;
		this.listFilesBackgroundColor = "#ffffff";
		this.listFilesColor = "#000000";
		this.listFilesborderColor = "#616161";
		this.fontSize = 14;
		this.padding = 10;
		this.paddingLeft = 10;
		this.paddingRight = 10;
		this.paddingBottom = 10;
		this.paddingTop = 10;
		this.previewImgHeight = 150;
		this.previewImgWidth = 134;
		this.floatStyle = KoolFileManager.isIE ? "styleFloat" : "cssFloat"

		this.selectedFiles = [];				// the files selected by the user in the file selection pane
		this.reqUploadFile = null;				// file upload object
		this.uploadFiles = [];					// files to be uploaded
		this.uploadedFiles = [];				// files uploaded
		this.listFilesDataProvider = []			// the information of the file to be uploaded
		this.currentUploadFileIndex = 0;		// the index of the file currently being uploaded
		this.currentUploadImageIndex = 0;
		this.currentUploadSizeTotal = 0;		// the total size of the files uploaded
		this.currentUploadSize = 0;				// the size of the file currently being uploaded
		this.currentUploadedSize =0;			// the size of the file uploaded
		this.uploadStartTime = null;			// the variable measuring the elapsed time
		this.currentPreviewImgIndex = -1;		// the index of the image currently being previewed
		this.previewImgWidth = 134;				// the width of the preview image
		this.speedArr = [];						// the variable measuring the transmission speed
		this.inUpload = true;					// whether or not currently in the middle of uploading
		//this.reqDownloadFile = null;			// file download object
		this.uploadSuccessTimer = null;			// timer - whether or not the COMPLETE event occurs
		this.uploadServerDataTimer = null;		// timer - whether or not the UPLOAD_COMPLETE_DATA event occurs after the COMPLETE event
		this.previewLoadSuccessTimer = null;	// timer - loading the preview image
		this.previewLoadingFile = null;			// the file object being loaded for Preview
		this.progressCount = 0;

		// drag and drop
		this.dragStartItem;
		this.dragEnterItem;
		this.tempList;

		// ImageUploader Property
		this.maxImageWidth = 0; 				// the maximum width of the image
		this.maxImageHeight = 0; 				// the maximum height of the imag
		this.thumbnailWidth = 140; 				// the thumb nail width
		this.thumbnailHeight = 100;				// the thumb nail height
		this.tileWidth = 150; 					// the width of the tile containing the image and file name
		this.tileHeight = 130 					// the height of the tile containing the image and file name
		this.tilePadding = 5;
		this.tilePaddingLeft = 5; 				// the left margin of the tile, thumb nail and title
		this.tilePaddingTop = 5; 				// the top margin of the tile, thumb nail and title	
		
		// user interface
		this.uploadVBox;						// for displaying the uploading status VBox
		this.uploadBox;							// for displaying the uploading status Box
		this.uploadControlBox;					// for displaying the control function of the file being uploaded
		this.info;								// for the information of the files to be uploaded (the text in uploadBtnControlBar)
		this.btnFileAdd;						// for adding the files to be uploaded (the button in uploadBtnControlBar)
		this.btnFileRemove;						// for deleting the files to be uploaded (the button in uploadBtnControlBar)			
		this.btnUpload;							// for starting uploading (the button in uploadBtnControlBar)
		this.uploadHBox;						// for displaying the preview image of the files to be uploaded HBox
		this.previewBox;						// for displaying the preview image of the files to be uploaded Box.
		this.previewImgBox;						// for controlling the size of the preview image Box.
		this.previewImg;						// for the image showing the preview image of the files to be uploaded
		this.contentBox							// for displaying the uploading status
		this.listFiles;							// for displaying the uploading history (the list in uploadHBox)
		this.inputFile;

		// for ImageUploader
		this.imageUploadBox;
		this.imageBox;
		this.imageListBox;
	}

	Uploader.prototype.createChildrean = function(rootDiv) {
		if (!this.uploadVBox) {
			this.uploadVBox = new Box();
			this.uploadVBox.element.className = elementClassName+"VBox";
			this.uploadVBox.verticalGap = 0;
			rootDiv.appendChild(this.uploadVBox.element);
		}
		
		if (this.buttonPlacement == "top") {
			if (!this.uploadControlBox && this.showControlBox) {
				this.uploadControlBox = new Box();
				this.uploadControlBox.element.className = elementClassName+"ControlBox";
				this.uploadControlBox.direction = "horizontal";
				this.uploadControlBox.horizontalAlign = "right";
				this.uploadControlBox.verticalAlign = "middle";
				this.uploadControlBox.percentWidth = "100%";
				this.uploadControlBox.height = 30;
				this.uploadVBox.children.push(this.uploadControlBox);
			}
		}
		
		if (!this.imageUploadBox && this.showHBox) {
			this.imageUploadBox = new Box();
			this.imageUploadBox.element.className = elementClassName+"IListBox";
			this.imageUploadBox.percentWidth = "100%";
			this.imageUploadBox.percentHeight = "100%";

			this.imageUploadBox.element.ondragover = function() {
				return false;
			}

			this.imageUploadBox.element.ondragend = function() {
				return false;
			}

			this.imageUploadBox.element.ondrop = function(e) {
				e.preventDefault();
				_uploader.onchange(e);
				return false;
			}

			this.uploadVBox.children.push(this.imageUploadBox);
		}
		if (this.buttonPlacement == "bottom") {
			if (!this.uploadControlBox && this.showControlBox) {
				this.uploadControlBox = new Box();
				this.uploadControlBox.element.className = elementClassName+"ControlBox";
				this.uploadControlBox.direction = "horizontal";
				this.uploadControlBox.horizontalAlign = "right";
				this.uploadControlBox.verticalAlign = "middle";
				this.uploadControlBox.percentWidth = "100%";
				this.uploadControlBox.height = 30;
				this.uploadVBox.children.push(this.uploadControlBox);
			}
		}

		this.uploadVBox.setActualSize(Utils.getStyle(rootDiv, "width"), Utils.getStyle(rootDiv, "height"));
		this.uploadVBox.invalidateProperties();
		this.uploadVBox.invalidateDisplayList();		
		
		if (!this.info && this.showInfo && this.uploadControlBox) {
			//position:relative; float:left;top:10px;left:10px
			this.info = Utils.createElement("span",elementClassName+"Info");
			this.info.innerHTML = rootDiv.updateUploadInfoText();
			this.uploadControlBox.element.appendChild(this.info);
		}

		if (!this.btnUpload && this.showUploadBtn && this.uploadControlBox) {
			//style="position:relative; float:right; right:10px;top:10px"
			if (this.uploadBtnImageUrl == "") {
				this.btnUpload = Utils.createElement("input",elementClassName+"UploadButton");
				this.btnUpload.type = "button";
				this.btnUpload.value = this.uploadBtnLabel;
			} else {
				//this.btnUpload.type = "image";
				//this.btnUpload.src = this.uploadBtnImageUrl;
				this.btnUpload = Utils.createElement("input",elementClassName+"ButtonImage");
				this.btnUpload.type = "button";
				this.btnUpload.style.background = "url('" + this.uploadBtnImageUrl + "')";
			}
			this.btnUpload.title = "Upload";
			this.btnUpload.disabled = true;
			this.btnUpload.onclick = function(e) {
				var flag = true;
				if (CallBackHelper.findFunction(_uploader.uploaderUploadClickJsFunction)) {
					flag = CallBackHelper.findFunction(_uploader.uploaderUploadClickJsFunction)(_uploader.rootDiv.id);
				};
				if (flag) {
					rootDiv.startUpload();
				}
			}

			this.uploadControlBox.element.appendChild(this.btnUpload);
		}

		if (!this.btnFileRemove && this.showFileRemoveBtn && this.uploadControlBox) {
			if (this.fileRemoveBtnImageUrl == "") {
				this.btnFileRemove = Utils.createElement("input",elementClassName+"RemoveButton");
				this.btnFileRemove.type = "button";
				this.btnFileRemove.value = this.fileRemoveBtnLabel;
			} else {
				//this.btnFileRemove.type = "image";
				//this.btnFileRemove.src = this.fileRemoveBtnImageUrl;
				this.btnFileRemove = Utils.createElement("input",elementClassName+"ButtonImage");
				this.btnFileRemove.type = "button";
				this.btnFileRemove.style.background = "url('" + this.fileRemoveBtnImageUrl + "')";
			}	
			this.btnFileRemove.title = "Delete File";

			this.btnFileRemove.onclick = function() {
				rootDiv.removeFile();
			}

			this.uploadControlBox.element.appendChild(this.btnFileRemove);
		}

		if (!this.btnFileAdd && this.showFileAddBtn && this.uploadControlBox) {
			if (this.fileAddBtnImageUrl == "") {
				this.btnFileAdd = Utils.createElement("input",elementClassName+"AddButton");
				this.btnFileAdd.type = "button";
				this.btnFileAdd.value = this.fileAddBtnLabel;
			} else {
				this.btnFileAdd = Utils.createElement("input",elementClassName+"ButtonImage");
				this.btnFileAdd.type = "button";
				this.btnFileAdd.style.background = "url('" + this.fileAddBtnImageUrl + "')";
			}			
			this.btnFileAdd.title = "Add File";
			this.btnFileAdd.onclick = function() {
				rootDiv.addFile();
			}

			this.uploadControlBox.element.appendChild(this.btnFileAdd);
		}

		if (!this.imageBox && this.imageUploadBox) {
			this.imageBox = Utils.createElement("div",elementClassName+"ImageBox");
			var w = this.getStyle(this.imageUploadBox.element,"width"),
				h = this.getStyle(this.imageUploadBox.element,"height"),
				padding = 10;
			this.setStyle(this.imageBox,"width",(w-padding*2)+"px");
			this.setStyle(this.imageBox,"height",(h-padding*2)+"px");
			this.setStyle(this.imageBox,"left",padding+"px");
			this.setStyle(this.imageBox,"top",padding+"px");

			this.imageUploadBox.element.appendChild(this.imageBox);
		}

		if (!this.listFiles && this.imageBox) {
			this.listFiles = Utils.createElement("div",elementClassName+"ImageListBox");
			var w = this.getStyle(this.imageBox,"width"),
				h = this.getStyle(this.imageBox,"height"),
				padding = 10;
			this.setStyle(this.listFiles,"width",(w-padding*2)+"px");
			this.setStyle(this.listFiles,"height",(h-padding*2)+"px");
			this.setStyle(this.listFiles,"left",padding+"px");
			this.setStyle(this.listFiles,"top",padding+"px");

			this.imageBox.appendChild(this.listFiles);
		}

		if (!this.inputFile) {
			this.inputFile = Utils.createElement("input", elementClassName + "_inputFile");
			this.inputFile.type = "file";
			this.setStyle(this.inputFile,"width","0px");
			this.setStyle(this.inputFile,"height","0px");
			this.inputFile.multiple = "multiple";
			if (this.fileFilterExtension != "")
				this.inputFile.accept = this.fileFilterExtension;
			else
				this.inputFile.accept = "image/*";
			this.inputFile.onchange = function(e){
				_uploader.onchange(e);					
			}
			this.uploadVBox.element.appendChild(this.inputFile);
		}
	}

	Uploader.prototype.onchange = function(e) {		
		var target = e.dataTransfer || e.target,
			i,j,files = target.files,
			nfl = files.length,
			ofl = _uploader.listFiles.children.length,
			maxFilesCount = _uploader.maxFileCount,
			maxFileSize = _uploader.maxFileSize,
			maxUploadSize = _uploader.maxUploadSize,
			fExt = _uploader.forbiddenExtensions,
			upSize = this.rootDiv.getUploadFileSize(),
			isUploaded = e.isUploaded,
			foundArr = [];	
		_uploader.uploadFilesCnt = _uploader.uploadFiles.length;
		_uploader.tempSLength = _uploader.listFiles.children.length;

		if (maxFilesCount > 0) {
			if(nfl+ofl > maxFileCount) {
				alert("Maximum "+maxFileCount+" files can be uploaded.");
				return false;
			}
		}
		// converting filelist to array
		var a = [];
		for (i = 0 ; i < files.length; i++) {
			a.push(files[i]);
		}
		files = a;

		// removing the duplicate file names
		if (_uploader.uploadFiles && !KoolFileManager.isSafari) {	
			var check = false;
			for (i = 0 ; i < files.length; i++) {
				
				for (j = 0 ; j < _uploader.uploadFiles.length; j++) {
					if (files[i].name == _uploader.uploadFiles[j].name) {								
						foundArr.push(files[i].name);
						check = true;
						break;
					}
				}
				if (check == true) {
					files.splice(i,1);							
					check = false;
					i--;
				}
			}
		}

		// alerting the duplicate file names
		if (_uploader.fileDuplicateMessageLineLimit >= 0) {
			var fnames = "",fFlag=false;
			var m = foundArr.length;
			
			for (i = 0 ; i < foundArr.length ; i++) {											
				if (_uploader.fileDuplicateMessageLineLimit > 0 && i >= _uploader.fileDuplicateMessageLineLimit) {
					if (m > 1) {
						fnames = m+" files including "+fnames+"\n";
					}
					break;
				}
				fnames += foundArr[i]+"\n";						
				fFlag = true;						
			}
			if (fFlag) {
				var msg = fnames + (m > 1 ? "have " : "has ") + "been already chosen."; 
				alert(msg);
			}
		}
		
		_uploader.tempFiles = files;
		_uploader.cnt = 0;
		var can = document.createElement("canvas");
		var con = can.getContext( '2d' );
		 _uploader.tempImage.can = can;
		 _uploader.tempImage.con = con;
		_uploader.currentUploadImageIndex = 0;
		_uploader.listFilesDataProvider = [];
		
		createItem();
		function createItem() {
			if (_uploader.currentUploadImageIndex == _uploader.tempFiles.length) {
				if (CallBackHelper.findFunction(_uploader.uploaderFileAddedJsFunction)) {
					CallBackHelper.findFunction(_uploader.uploaderFileAddedJsFunction)(_uploader.rootDiv.id,e.target.files);
				};
				return false;
			}
			var rd = _uploader.tempReader;	
			var image = _uploader.tempImage;
			var i = _uploader.currentUploadImageIndex;
			
			if (!e.isUploaded) {
				if (!files[i].type.match("image.*")) {
					alert("The file type ("+files[i].name+") cannot be chosen.");
					return false;
				};
			}
			
			if (maxFileSize > 0) {
				if (maxFileSize *1024*1024 < files[i].size) {
					alert(files[i].name+" has exceeded the maximum size "+maxFileSize+"MBytes.");
					_uploader.currentUploadImageIndex++;							
					//createItem();
					return false;
				}
			}

			// checking the maximum upload size
			if (maxUploadSize > 0) {
				upSize += files[i].size;
				
				if(maxUploadSize *1024*1024 < upSize){
					alert("The maximum upload size is "+maxUploadSize+"MBytes.");
					upSize -= files[i].size;
					_uploader.currentUploadImageIndex++;							
					//createItem();
					return false;
				}
			}

			if (fExt.length > 0) {
				var tempEx = ","+forbiddenExtensions+",";
				var ext = files[i].name.substring(files[i].name.lastIndexOf(".")+1);
				ext = ext.toLowerCase();
				if (tempEx.indexOf(ext) >-1) {
					alert("The file type ("+files[i].name+") cannot be chosen.");
					return false;
				}			
			}

			var w = _uploader.thumbnailWidth,
				h = _uploader.thumbnailHeight,
				paddingLeft = _uploader.tilePadding,
				paddingTop = _uploader.tilePadding;

			var ch = Utils.createElement("div", elementClassName + "IListItem");
			Utils.setStyle(ch,"width",_uploader.tileWidth+"px");
			Utils.setStyle(ch,"height",_uploader.tileHeight+"px");
			ch.draggable = _uploader.dragMoveEnabled;

			var chImgBox = Utils.createElement("div", elementClassName + "IListItemImageBox");
			Utils.setStyle(chImgBox,"width",w+"px");
			Utils.setStyle(chImgBox,"height",h+"px");
			Utils.setStyle(chImgBox,"left",paddingLeft+"px");
			Utils.setStyle(chImgBox,"top",paddingTop+"px");
			
			chImgBox.draggable = false;

			var chImg = Utils.createElement("img", elementClassName + "IListItemImage");						
			Utils.setStyle(chImg,"width",w-40+"px");
			Utils.setStyle(chImg,"height",h-8+"px");
			Utils.setStyle(chImg,"marginLeft",20+"px");
			Utils.setStyle(chImg,"marginTop",4+"px");
			
			chImgBox.appendChild(chImg);

			if (e.isUploaded) {
				chImg.src = files[i].fileURL;
			}
			chImg.draggable = false;

			var chText = Utils.createElement("span", elementClassName + "IListItemText");
			Utils.setStyle(chText,"width",w+"px");
			Utils.setStyle(chText,"left",paddingLeft+6+"px");
			Utils.setStyle(chText,"top",paddingLeft+"px");
			chText.draggable = false;
			
			var txt = "";
					
			txt = files[i].name;
			if (CallBackHelper.findFunction(_uploader.uploaderListTextJsFunction)) {
				txt = CallBackHelper.findFunction(_uploader.uploaderListTextJsFunction)(_uploader.rootDiv.id,files[i].name,files[i].size);
			};
			
			chText.innerHTML =txt;		

			if (_uploader.removeBtnSrc != "") {
				chRemoveImg = Utils.createElement("input", elementClassName + "IListItemRemoveButton");
				chRemoveImg.type = "image";
				chRemoveImg.src = _uploader.removeBtnSrc;
				Utils.setStyle(chRemoveImg,"right",2+"px");
				Utils.setStyle(chRemoveImg,"marginTop",4+"px");
				//Utils.setStyle(chRemoveImg,"left",_uploader.tileWidth-paddingLeft+"px");
				chRemoveImg.draggable = false;
				chRemoveImg.onclick = function(e) {
					_uploader.rootDiv.removeFile(this.parentNode);
				}
				chRemoveImg.ondragstart = function() {
					return false;
				}
			}
			var chDownload = null;
			if (e.isUploaded) {
				chDownload = Utils.createElement("input", elementClassName + "IListItemDownloadButton");
				chDownload.type="image";
				chDownload.src = "../Image/download_button.png";
				Utils.setStyle(chDownload,"right",20+"px");
				Utils.setStyle(chDownload,"marginTop",4+"px");
				chDownload.onclick = function(e) {
					var url = "";
					for (var i = 0 ; i  < _uploader.uploadFiles.length ; i++) {
						if (this.parentNode.parentNode == _uploader.uploadFiles[i].element) {
							url = _uploader.uploadFiles[i].fileURL;																	
							break;
						}
					}
					if (window.ActiveXObject || "ActiveXObject" in window) {
						var iframe = Utils.createElement("iframe", elementClassName + "iframe");
						iframe.display = "none";
						this.appendChild(iframe);
						iframe.src = url;
						this.removeChild(iframe);
					} else {
						window.open(url,"_blank");
					}
				}
				chDownload.ondragstart = function() {
					return false;
				}
			}
			
			ch.appendChild(chImgBox);
			
			if (chDownload) {
				chImgBox.appendChild(chDownload);
			}
			chImgBox.appendChild(chRemoveImg);

			var downloadIcon = "";
			if (e.isUploaded) {
				downloadIcon = "../Image/download_icon.png";
			} else {
				downloadIcon = "../Image/upload_icon.png";
			}

			var chIcon = Utils.createElement("img", elementClassName + "ListItemIcon");
			chIcon.src = downloadIcon;
			chIcon.ondragstart = function() {
				return false;
			}
			Utils.setStyle(chIcon,"left",paddingLeft+3+"px");
			Utils.setStyle(chIcon,"top",paddingLeft+3+"px");
			chIcon.style.position = "relative";
			ch.appendChild(chIcon);
			ch.appendChild(chText);
			
			addEvent(ch,"dragenter", function(e) {
				var i,ch,list = _uploader.listFiles.children;
				for (i = 0 ; i < list.length ; i++) {
					if (list[i] === e.target) {
						_uploader.dragEnterItem = i;								
						break;
					}
				}
			});
			
			addEvent(ch,"dragstart", function(e) {
				var i,ch,list = _uploader.listFiles.children;
				for(i = 0 ; i < list.length ; i++){
					if(list[i] === e.target){
						_uploader.dragStartItem = i;
						break;
					}
				}
				// for Firefox, setData() must be executed
				if(KoolFileManager.isFirefox){
					e.dataTransfer.setData('index', i);
				}
			});
			addEvent(ch,"dragleave", function(e) {
				var i,ch,list = _uploader.listFiles.children;
				for (i = 0 ; i < list.length ; i++) {
					if (list[i] === e.target) {
						break;
					}
				}
			});
			
			addEvent(ch,"dragend", function(e) {
				var i,j,list = _uploader.listFiles.children;
				if (_uploader.dragStartItem  < _uploader.dragEnterItem) {
					_uploader.listFiles.insertBefore(list[_uploader.dragStartItem],list[_uploader.dragEnterItem+1]);
				} else if (_uploader.dragStartItem  > _uploader.dragEnterItem) {
					_uploader.listFiles.insertBefore(list[_uploader.dragStartItem],list[_uploader.dragEnterItem]);
				}
				var arr = [];
				for (i = 0 ; i < list.length; i++) {
					var item;
					for (j = 0 ; j < _uploader.uploadFiles.length; j++) {
						if (_uploader.uploadFiles[j].element === list[i]) {
							item = _uploader.uploadFiles[j];
							break;
						}
					}
					arr.push(item);
				}
				_uploader.uploadFiles = arr;
			});		

			// click event on items
			ch.onclick = function(e) {
				
				for (var i = 0 ; i < _uploader.uploadFiles.length; i++) {
					if (this === _uploader.uploadFiles[i].element) {
						_uploader.selectedFiles = _uploader.uploadFiles[i];
						break;
					}
				}
				if (this.parentNode) {
					var i,ch = this.parentNode.children;
					
					var col = _uploader._defaultBackgroundColor;
					var borcol = _uploader._defaultBorderColor;
					for(i = 0 ; i < ch.length ; i++){
						Utils.setStyle(ch[i],"backgroundColor","");
						Utils.setStyle(ch[i],"color","#888888");
						Utils.setStyle(ch[i].children[0],"backgroundColor",col);
					}
					Utils.setStyle(this,"backgroundColor","#348fd6");
					Utils.setStyle(this,"color","#ffffff");
					Utils.setStyle(this.children[0],"backgroundColor","#348fd6");
					if (!isNull(_uploader.previewImg)) {		// only if preview exists
						if (_uploader.selectedFiles.fileURL) {
							if (!_uploader.selectedFiles.fileURL.match(/\.(jpg|jpeg|png|gif)$/)) {
								_uploader.previewImg.src =  _uploader.previeImgSrc;
							} else {
								_uploader.previewImg.src = _uploader.selectedFiles.fileURL;
							}
							
						} else {
							if (_uploader.previewEnable && _uploader.selectedFiles.type.match("image.*")) {
								var rd = new FileReader();
					
								rd.onload = function(e) {
									_uploader.previewImg.src = e.target.result;
								
								}
								rd.readAsDataURL(_uploader.selectedFiles);
								
							} else {
								_uploader.previewImg.src =  _uploader.previeImgSrc;
							}
						}
					}
				}
			}
					
			// double click event on items
			if (_uploader.doubleClickEnabled) {
				addEvent(ch,"dblclick", function(e) {
					for (var i = 0 ; i < _uploader.uploadFiles.length; i++) {
						if (this === _uploader.uploadFiles[i].element) {
							_uploader.selectedFiles = _uploader.uploadFiles[i];
							break;
						}
					}
					
					var genId = "";
					if (_uploader.generateFileID) {
						genId =  _uploader.selectedFiles.generateFileID;
					}
					var fileInfo = {
						name : _uploader.selectedFiles.name,
						size : _uploader.selectedFiles.size,
						fileid : genId
					}
					CallBackHelper.findFunction(_uploader.itemDoubleClickJsFunction)(_uploader.rootDiv.id,i,fileInfo);	
				});
				
			}
					
			ch.title = files[i].name;		

			var fmd = [];
			if (_uploader.generateFileID) {
				var genId="";
				var dateStr = Utils.getDate();
				var ran = Utils.zeroPad(Math.floor(Math.random() * 9999) + 1,4);
				var ext = files[i].name.substring(files[i].name.lastIndexOf("."));
				genId = dateStr+ran+ext;
				files[i].generateFileID = genId;
				fmd["generateFileID"] = genId;
			}
			fmd["isFormField"] = true;
			fmd[_uploader.uploadFieldName] = files[i];
			files[i].formdata = fmd;
			files[i].element = ch;
			_uploader.listFiles.appendChild(ch);
			_uploader._defaultBackgroundColor = Utils.getStyle(ch.children[0],"backgroundColor");
			_uploader._defaultBorderColor = Utils.getStyle(ch.children[0],"borderColor");
			_uploader.uploadFiles.push(files[i]);
			
			rd.onload = function(e) {				
				image.onload = function(e) {					
					this.can.width = _uploader.thumbnailWidth;
					this.can.height = _uploader.thumbnailHeight;
					this.con.drawImage(this,0,0,_uploader.thumbnailWidth,_uploader.thumbnailHeight);
					var th = this.can.toDataURL();
					var cnt = _uploader.tempSLength;
					if (!cnt) {
						cnt = 0;
					}
					cnt = _uploader.currentUploadImageIndex+cnt;
					_uploader.listFiles.children[cnt].firstChild.firstChild.src = th;
					thumb = null;
					this.con.beginPath();
					
					var isResize = false,
						curWidth = this.width,
						curHeight = this.height;
					if (_uploader.maxImageWidth > 0) {
						if (curWidth > _uploader.maxImageWidth) {
							isResize = true;
						}
					}

					if (_uploader.maxImageHeight > 0) {
						if (curHeight > _uploader.maxImageHeight) {
							isResize = true;
						}
					}

					if (isResize) {
						var originRatio = _uploader.maxImageHeight / _uploader.maxImageWidth;
						var imgRatio = curHeight / curWidth;
						var resizeWidth,resizeHeight;
						if (imgRatio >= originRatio) {
							if (curHeight > _uploader.maxImageHeight) {
								resizeHeight = _uploader.maxImageHeight;
								resizeWidth = Math.round((curWidth*resizeHeight)/curHeight);
							} else {
								resizeWidth = curWidth;
								resizeHeight = curHeight;
							}
							
						} else if (imgRatio < originRatio) {
							if (curWidth > _uploader.maxImageWidth) {
								resizeWidth = _uploader.maxImageWidth;
								resizeHeight = Math.round((curHeight*resizeWidth)/curWidth);
							} else {
								resizeWidth = curWidth;
								resizeHeight = curHeight;
							}

						} else {
							resizeWidth = curWidth;
							resizeHeight = curHeight;
						}
						var canvas = document.createElement("canvas");
						canvas.width = resizeWidth;
						canvas.height = resizeHeight;
						var context = canvas.getContext('2d');
						context.drawImage(this,0,0,resizeWidth,resizeHeight);
						
						var data = canvas.toDataURL(_uploader.uploadFiles[i].type);
						var blob = Utils.dataUriToBlob(data,_uploader.uploadFiles[cnt].name);
						_uploader.uploadFiles[cnt].formdata[_uploader.uploadFieldName] = blob;
						_uploader.uploadFiles[cnt].formdata.fileName = _uploader.uploadFiles[cnt].name;
					}
					_uploader.currentUploadImageIndex++;	
					createItem();
				}
				image.onerror = function(e) {
					var cnt = _uploader.uploadFilesCnt;
					if (!cnt) {
						cnt = 0;
					}
					cnt = _uploader.currentUploadImageIndex+cnt-1;
					_uploader.listFiles.children[cnt].children[0].firstChild.src = _uploader.previeImgSrc;
					
					_uploader.currentUploadImageIndex++;							
					createItem();
				}
				
				try {
					image.src = e.target.result;
				} catch(e) {
					//alert("onload error");
				}
			}
			rd.onerror = function(e) {
				trace("Error while loading a file");
			}
			rd.onloadend = function(e) {
			}
				
			if (_uploader.info) {
				_uploader.info.innerHTML = _uploader.rootDiv.updateUploadInfoText();
			};
			if (!e.isUploaded) {
				rd.readAsDataURL(_uploader.tempFiles[_uploader.currentUploadImageIndex]);
			} else {
				_uploader.currentUploadImageIndex++;
				createItem();
			}
		}

		if (_uploader.info) {
			_uploader.info.innerHTML = this.rootDiv.updateUploadInfoText();
		};
		if (_uploader.btnUpload) {
			_uploader.btnUpload.disabled = false;
		};
	}

	var elementClassName = "KoolFileManager_",
		boxSizing = (KoolFileManager.isIE || KoolFileManager.isOpera || KoolFileManager.isSafari) ? "boxSizing" : (KoolFileManager.isFirefox ? "MozBoxSizing" : "webkitBoxSizing"),
		cssStyleList = {"cornerRadius":"borderRadius", "borderThickness":"borderWidth"};

	var ElementManager = {
		uid : 0,
		cache : {},
		stores : {},

		insert : function( o ) {
			var id = "KoolFileManager.element_" + ElementManager.uid;
			ElementManager.uid += 1;
			ElementManager.cache[ id ] = o;
			return id;
		},

		push : function( obj ) {
			var id,
				elem,
				elems = ElementManager.cache;

			for (id in elems) {
				if (elems[id] === obj[0]) {
					elem = elems[id];
					break;
				}
			}

			if (elem === undefined) {
				id = ElementManager.insert(obj[0]);
				elem = elems[id];
			}

			if (elem.property === undefined) {
				elem.property = [];
			}

			elem.property.push(obj[1]);
		},
		
		dataMove : function( id ) {
			ElementManager.stores[id] = ElementManager.cache;
			ElementManager.cache = {};
		},

		cleanData : function( id ) {
			var i,
				n,
				id,
				elem,
				prop,
				event,
				elems = ElementManager.stores[id];
				
			for (id in elems) {
				if (id !== undefined) {
					if (elems[id]._$events) {
						event = elems[id]._$events;
						if (elems[id].removeEventListener) {
							removeEvent(elems[id],event["type"],event["handler"]);
						} else {
							delete elems[id].events[event["type"]][event["handler"].$$guid];
						}
						try {
							delete elems[id]._$events;
						} catch(e) {
							elems[id]._$events = undefined;
						}
					}

					if (elems[id].property !== undefined ) {
						for ( i = 0, n = elems[id].property.length ; i < n ; i += 1) {
							prop = elems[id]["property"][i];
							elems[id][prop] = null;
						}
					}

					elems[id] = null;
					delete elems[ id ];
				}
			}
			
			delete ElementManager.stores[id];
			ElementManager.uid = 0;

			elems = [];
			elem = event = null;
		}
	};

	/*--------------------------------------------------------------------------
	 *
	 * UIElement Class
	 *
	 *-------------------------------------------------------------------------*/

	/**
	 * base UI class
	 */
	function UIElement(element, className) {
		this.x = 0;
		this.y = 0;
		this.width = 0;
		this.height = 0;
		this.visible = true;
		this.className = className;
		this.element = document.createElement(element);
		this._elementAdded = false;
		this.element.className = elementClassName + className;
		if(this.element === "div")
			this.element.style[boxSizing] = "content-box";
	};

	UIElement.prototype = new EventDispatcher();
	UIElement.prototype.constructor = UIElement;

	/**
	 * element will be a child of the target <DIV>
	 */
	UIElement.prototype.addElement = function(p) {
		if(!this._elementAdded) {
			this._elementAdded = true;
			this.element.style.position = "absolute";
			if(!isNull(this.className))
				this.element.className = elementClassName + this.className;
			this.parentElement = p;
			p.appendChild(this.element);
		}
	};

	/**
	 * removing an element
	 */
	UIElement.prototype.removeElement = function(reset) {
		if(this._elementAdded && this.element) {
			this._elementAdded = false;
			this.parentElement.removeChild(this.element);
			if(reset == true)
				this.element = null;
		}
	};

	// setting the width and height of UI
	UIElement.prototype.setActualSize = function(w, h) {
		if(isNaN2(w) || isNaN2(h)) {
			return;
		}

		this.width = w;
		this.height = h;
		if(this.element && !isNaN2(w) && !isNaN2(h)) {
			this.element.style.width = w + "px";
			this.element.style.height = h + "px";
		}
	};

	// setting the location of UI
	UIElement.prototype.move = function(x, y) {
		this.x = x;
		this.y = y;
		if(this.element && !isNaN2(x) && !isNaN2(y)) {
			this.element.style.left = x + "px";
			this.element.style.top = y + "px";
		}
	};

	// setting visible
	UIElement.prototype.setVisible = function(value) {
		if(this.element) {
			if(this.visible == value)
				return;
			this.visible = value;
			this.element.style.visibility = value ? "visible" : "hidden";
		}
	};

	UIElement.prototype.invalidateProperties = function() {
		this.commitProperties();
	};

	// UI configuration
	UIElement.prototype.invalidateDisplayList = function() {
		this.updateDisplayList(this.width, this.height);
	};

	UIElement.prototype.commitProperties = function() {
	};

	UIElement.prototype.updateDisplayList = function(unscaledWidth, unscaledHeight) {
	};


	/*--------------------------------------------------------------------------
	 *
	 * Box Class
	 *
	 *-------------------------------------------------------------------------*/
	function Box() {
		UIElement.call(this, "div", "Box");
		
		this.div = new UIElement("div","Box");
		
		this.x = 0;
		this.y = 0;
		this.width = NaN;
		this.height = NaN;
		this.percentWidth = NaN;
		this.percentHeight = NaN;
		this.paddingLeft = 0;
		this.paddingTop = 0;
		this.paddingBottom = 0;
		this.paddingRight = 0; 					// padding right
		this.direction = "vertical"; 			// vertical, horizontal
		this.horizontalGap = 6;
		this.horizontalAlign = "left"; 			// left, center, right
		this.verticalGap = 6;
		this.verticalAlign = "top"; 			// top, middle, bottom
		this.verticalScrollPolicy = "off"; 		// off, on, auto
		this.horizontalScrollPolicy = "off"; 	// off, on, auto
		this.borderStyle = "none";
		this.backgroundColor = "";
		this.backgroundAlpha = 1;
		this.borderColor = "#b7babc";
		this.borderThickness = 1;
		this.verticalScrollPolicy = "off"; 		// hidden, scroll, auto, visible
		this.horizontalScrollPolicy = "off"; 	// hidden, scroll, auto, visible
		this.wrapScrollValue = {"off":"hidden","on":"scroll","auto":"auto","visible":"visible"};

		this.children = []; 					// defaultProperty
		this.floatStyle = KoolFileManager.isIE ? "styleFloat" : "cssFloat";
		
		this.getStyle = Utils.getStyle;
		this.setStyle = Utils.setStyle;
		
		this.element.box = this;
		this.element.style.position = "relative";
		this.element.style[this.floatStyle] = "left";
		this.element.style.overflow = KoolFileManager.overflow ? "hidden" : "visible";
	};
	
	Box.prototype = new UIElement();
	Box.prototype.constructor = Box;

	Box.prototype.defaultProperty = "children";
	
	/**
	 * calculating the size of this using the size of children
	 */
	Box.prototype.getRectSize = function(){
		var cInfo,
			child,
			pw, ph,
			tempw = 0,
			temph = 0,
			chilw = 0,
			childh = 0,
			bw = this.borderThickness * 2;

		if (this.element.parentElement !== null) {
			pw = this.getStyle(this.element.parentElement, "width");
			ph = this.getStyle(this.element.parentElement, "height");
		}

		for (var i = 0, n = this.children.length ; i < n ; i += 1) {
			child = this.children[i];
			
			childw = child.width;
			childh = child.height;

			if (/%/.test(childw)) {
				childw = Utils.per2pix(pw, childw);
			}

			if (/%/.test(childh)) {
				childh  = Utils.per2pix(ph, childh);
			}

			if (isNaN2(childw) && child.style !== undefined) {
				childw = this.getStyle(child, "width");
			}

			if (isNaN2(childh) && child.style !== undefined) {
				childh = this.getStyle(child, "height");
			}

			if (isNaN2(childw) || isNaN2(childh)) {
				cInfo = child.getRectSize();
				if (isNaN2(childw)) {
					childw = cInfo["width"];
				}
				if (isNaN2(childh)) {
					childh = cInfo["height"];
				}
			}

			tempw += childw + bw;
			temph += childh + bw;
		}

		if (n > 0) {
			tempw += ( n - 1 ) * this.horizontalGap;
			temph += ( n - 1 ) * this.verticalGap;
		}

		w = isNaN2(this.width) ? tempw : this.width;
		h = isNaN2(this.height) ? temph : this.height;

		if (w > pw)
			w = pw;
		if (h > ph)
			h = ph;
			
		return {"width":w, "height":h};
	}
	
	/**
	 * setting the width and height of child
	 */
	Box.prototype.getChildMeasure = function(child, w, h, pixWidth, pixHeight, wTotal, hTotal, gap) {
		var tcw,
			tch;

		tcw = child.percentWidth || child.width;
		tch = child.percentHeight || child.height;
		
		if (this.direction === "horizontal") {
			w -= gap + pixWidth;
		} else {
			h -= gap + pixHeight;
		}

		if (/%/.test(tcw)) {
			tcw = w * (Utils.per2Num(tcw) / wTotal);
		}

		if (/%/.test(tch)) {
			tch = h * (Utils.per2Num(tch) / hTotal);
		}

		if (isNaN2(tcw)) {
			tcw = this.getStyle(child, "width");
		}
		if (isNaN2(tch)) {
			tch = this.getStyle(child, "height");
		}

		return {"w":tcw, "h":tch};
	};
	
	// relocating children when resizing
	Box.prototype.changeXY = function() {
		var i,
			n,
			child,
			v = {},
			tw = 0,	th = 0,
			cw = 0,	ch = 0,
			bw = isNaN2(this.borderThickness) ? this.getStyle(this.element, "borderWidth") : this.borderThickness,
			info = this.initialize(this.width, this.height, bw * 2);
		
		v.x = info.x;
		v.y = info.y;
		v.wPercent = info.wPercent;
		v.hPercent = info.hPercent;
		v.pWidth = info.pixWidth;
		v.pHeight = info.pixHeight;
		v.cssName = this.floatStyle;

		for (i = 0 , n = this.children.length ; i < n ; i += 1) {
			child = this.children[i];
			if (child instanceof ChartBase) {
				if (child.element) {
					child = child.element;
				}
			} else if (child instanceof UIElement) {
				child = child.element;
			}
			if (child.legendDiv) {
				child = child.legendDiv;
			}
			
			info = this.getChildMeasure(child, this.width, this.height, v.pWidth, v.pHeight, v.wPercent, v.hPercent, 0);

			if (this.direction === "vertical") {
				switch(this.horizontalAlign) {
					case "center":
						v.x = (this.width - info.w ) * 0.5;
						break;
					case "right":
						v.x = this.width - info.w;
						break;
				}
				info.w = 0;
			} else if (this.direction === "horizontal") {
				switch (this.verticalAlign) {
					case "middle":
						v.y = ( this.height - info.h ) * 0.5;
						break;
					case "bottom":
						v.y = this.height - info.h;
						break;
				}
				info.h = 0;
			}

			if (this.getStyle(child, v.cssName) !== "none") {
				info.w = info.h = 0;
			}

			if (!(child instanceof UIComponent)) {
				this.setStyle(child, "left", v.x + tw + "px");
				this.setStyle(child, "top", v.y + th + "px");
				if (this.direction === "horizontal") {
					tw += this.horizontalGap;
				} else {
					th += this.verticalGap;
				}
				
				// redrawing by running invaldiateDisplayList() for memo
				if (child.className == elementClassName + "BorderLabel")
					child.element.invalidateDisplayList();
			}
		}
		info = null;
	};

	Box.prototype.initialize = function(w, h, bw) {
		var sx = 0, sy = 0,
			tcw = 0, tch = 0,
			cw = 0, ch = 0,
			pixWidth = 0,
			pixHeight = 0,
			wPercent = 0,
			hPercent = 0,
			horizontalOffset,
			verticalOffset,
			cInfo, retObj = {};

		// initializing sx, sy
		for( i = 0, n = this.children.length ; i < n ; i += 1) {
			child = this.children[i];
/*			
			if(child instanceof BorderLabel){
				cInfo = child.getRectSize();
				child.width = cInfo["w"];
				child.height = cInfo["h"];
			}
*/
			tcw = child.percentWidth || child.width;
			tch = child.percentHeight || child.height;
			
			horizontalOffset = verticalOffset = 0;
			
			// if width is a percentage value
			if (/%/.test(tcw)) {
				child.percentWidth = tcw;
				if (child.element) {
					child.element.percentWidth = child.percentWidth;
				}
				wPercent += Utils.per2Num(child.percentWidth);
				tcw = Utils.per2pix(w, tcw);
			} else {
				horizontalOffset = tcw;
			}
			
			// if height is a percentage value
			if (/%/.test(tch)) {
				child.percentHeight = tch;
				if (child.element) {
					child.element.percentHeight = child.percentHeight;
				}
				hPercent += Utils.per2Num(child.percentHeight);
				tch = Utils.per2pix(h, tch);
			} else {
				verticalOffset = tch;
			}
			
			if (( isNaN2(tcw) || isNaN2(tch)) && ( child instanceof Box)) {
				cInfo = child.getRectSize();
				if (isNaN2(tcw))
					tcw = horizontalOffset = child.width = cInfo["width"];
				if (isNaN2(tch))
					tch = verticalOffset = child.height = cInfo["height"];
			}
			
			if (isNaN2(tcw)) {
				tcw = this.getStyle(child, "width");
				//pixWidth += tcw;
			}
			if (isNaN2(tch)) {
				tch = this.getStyle(child, "height");
				//pixHeight += tch;
			}
			
			pixWidth += horizontalOffset;
			pixHeight += verticalOffset;
			
			if (this.direction === "vertical") {
				switch (this.verticalAlign) {
					case "top":
						sy = 0;
						break;
					case "middle":
					case "bottom":
						sy += tch;
						break;
					default:
				}
				
				switch (this.horizontalAlign) {
					case "left":
						sx = 0;
						break;
					default:
				}
			} else if (this.direction === "horizontal") {
				switch (this.verticalAlign) {
					case "top":
						sy = 0;
						break;
				}

				switch (this.horizontalAlign) {
					case "left":
						sx = 0;
						break;
					case "center":
					case "right":
						sx += tcw;
						break;
					default:
				}
			}
			cw += tcw;
			ch += tch;
		}
		
		if (isNaN2(w)) {
			w = cw;
		}

		if (isNaN2(h)) {
			h = ch;
		}

		if (this.direction === "vertical" && ( this.verticalAlign === "middle" || this.verticalAlign === "bottom" )) {
			sy += ( n - 1 ) * this.verticalGap;
			sy = (this.verticalAlign === "middle") ? ( h - sy - n * bw ) * 0.5 : (h > ch) ? h - sy - n * bw : 0;
		} else {
			sy = 0;
		}

		if (sy < 0)
			sy = 0;

		if (this.direction === "horizontal" && ( this.horizontalAlign === "center" || this.horizontalAlign === "right" )) {
			sx += ( n - 1 ) * this.horizontalGap;
			sx = (this.horizontalAlign === "center") ? ( w - sx - n * bw ) * 0.5 : w - sx;
		} else {
			sx = 0;
		}

		if (sx < 0)
			sx = 0;
		
		if (this.direction === "horizontal") {
			if (wPercent <= 100)
				wPercent = 100;
			hPercent = 100;
			pixHeight = 0;
			w -= (this.children.length > 1)? this.horizontalGap : 0;
		} else if (this.direction === "vertical") {
			if (hPercent <= 100)
				hPercent = 100;
			wPercent = 100;
			pixWidth = 0;
			h -= (this.children.length > 1) ? this.verticalGap : 0;
		}
		
		retObj.x = sx;
		retObj.y = sy;
		retObj.wPercent = wPercent;
		retObj.hPercent = hPercent;
		retObj.pixWidth = pixWidth;
		retObj.pixHeight = pixHeight;

		return retObj;
	};

	Box.prototype.commitProperties = function() {
		var i,
			n,
			child,
			childDiv;
		
		for (i = 0, n = this.children.length ; i < n ; i += 1) {
			child = this.children[i];
			
			childDiv = child;
			if (child instanceof UIElement || child.element !== undefined) {
				childDiv = child.element;
			}
			if (!Utils.isParentOf(this.element, childDiv)) {
				this.element.appendChild(childDiv);
			}
			if (child instanceof Box && child.children.length > 0) {
				child.commitProperties();
			}
		}
		
		this.setStyle(this.element, "borderWidth", "0px");
		this.setStyle(this.element, "overflowX", KoolFileManager.overflow ? this.wrapScrollValue[this.horizontalScrollPolicy] : "visible");
		this.setStyle(this.element, "overflowY", KoolFileManager.overflow ? this.wrapScrollValue[this.verticalScrollPolicy] : "visible");
		
		if (this.backgroundColor !== "")
			GraphicsUtils.drawBackgroundColor(this.element, this.backgroundColor, this.backgroundAlpha);
	};

	Box.prototype.updateDisplayList = function(unscaledWidth, unscaledHeight) {
		var i, n, bw, cInfo, child,
			tcw, tch, tcx, tcy,
			pixWidth = 0,
			pixHeight = 0,
			sx = 0, sy = 0, 		// initial location (X, Y)
			cx = 0, cy = 0, 		// current location (X, Y)
			wTotalPercent = 0,
			hTotalPercent = 0,
			verticalOffset = 0,
			horizontalOffset = 0,
			w = unscaledWidth, h = unscaledHeight;

		if (this.children === undefined || this.children.length < 1)
			return;

		bw = this.getStyle(this.element, "borderWidth") * 2;
		
		cInfo = this.initialize(w, h, bw);

		sx = cInfo.x;
		sy = cInfo.y;
		pixWidth = cInfo.pixWidth; 			// the value subtracted from the total width
		pixHeight = cInfo.pixHeight; 		// the value subtracted from the total height
		wTotalPercent = cInfo.wPercent; 	// the total percentage value of width
		hTotalPercent = cInfo.hPercent;		// the total percentage value of height

		cInfo = null;
		cw = ch = 0;
		
		// calculating the location of children
		for (i = 0, n = this.children.length ; i < n ; i += 1) {
			child = this.children[i];
		
			gap = this.direction === "horizontal" ? this.horizontalGap : this.verticalGap;
			gap *= (this.children.length - 1);
			
			cInfo = this.getChildMeasure(child, w, h, pixWidth, pixHeight, wTotalPercent, hTotalPercent, gap);
			tcw = cInfo.w;
			tch = cInfo.h;

			if (this.direction === "vertical") {
				switch (this.horizontalAlign) {
					case "center":
						sx = ( w - tcw ) * 0.5;
						break;
					case "right":
						sx = w - tcw;
						break;
				}
			} else if (this.direction === "horizontal") {
				switch (this.verticalAlign) {
					case "middle":
						sy = ( h - tch ) * 0.5;
						break;
					case "bottom":
						sy = h - tch;
						break;
				}
			}

			tcx = sx + cx;
			tcy = sy + cy;
			
			if (child instanceof UIElement) {
				child.move(tcx, tcy);
				child.setActualSize(tcw, tch);
				child.invalidateDisplayList();
			} else {
				this.setStyle(child, "left", tcx + "px");
				this.setStyle(child, "top", tcy + "px");
				this.setStyle(child, "width", tcw - horizontalOffset + "px");
				this.setStyle(child, "height", tch - verticalOffset + "px");
			}

			if (this.direction === "vertical") {
				cy += this.verticalGap;
			} else if (this.direction === "horizontal") {
				cx += this.horizontalGap;
			}

			cw += tcw;
			ch += tch;
		}
	};


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	/*--------------------------------------------------------------------------
	 *
	 * Method 
	 *
	 *-------------------------------------------------------------------------*/
	function isString(s) {
		return typeof s === "string";
	};

	function isArray(s) {
		return s.constructor === Array;
	};
	
	function isObject(obj) {
		return typeof obj === "object";
	};

	function isNumber(n) {
		return typeof n === "number";
	};

	function isFunction(obj) {
		return typeof obj === "function";
	};

// #ifndef PRODUCT
	function trace(value) {
		if (window.console)
			console.log(value);
	};
// #endif

	function isNaN2( obj ) {
		return isNaN(obj) || obj == null || !isNumber(obj);
	};

	function isNull(obj) {
		return obj == null || typeof obj === "undefined";
	};

	function stringToBoolean(str) {
		if (str == "true") {
			return true;
		} else {
			return false;
		}
	}
	

	/**
	* @private
	* running the function f(), passed by the parameter
	*/
	function domReady(f) {
		if (domReady.done) {
			return f();
		}

		if (domReady.timer) {
			domReady.ready.push(f);
		} else {
			// addEvent(window, "load", function() {
			//		domReady.loaded = true
			//});
			domReady.ready = [f];
			domReady.timer = setInterval(isDOMReady, 10);
		}
	}

	/**
	* @private
	* function for waiting DOM is ready
	*/
	function isDOMReady() {
		if (domReady.done) {
			return false;
		}

		if (document && document.getElementsByTagName && document.getElementById && document.body && document.readyState == "complete") {
			clearInterval(domReady.timer);
			domReady.timer = null;

			for (var i=0; i<domReady.ready.length; i++) {
				domReady.ready[i]();
			}
			domReady.ready = null;
			domReady.done = true;
		}

		////tace('isDomReady ' + ", " + domReady.done);
	}

	/*--------------------------------------------------------------------------
	 *
	 * Event Class
	 *
	 *-------------------------------------------------------------------------*/
	/**
	 * creating user-defined events
	 * @param type		event name
	 * @param target	the object in which the event occurred
	 */
	var Event = function(type, target) {
		this.type = type;
		this.target = target;
		this.currentTarget;
	};

	/**
	 * event list
	 */
	Event.eventList = [];

	
	/*--------------------------------------------------------------------------
	 *
	 * EventDispatcher Class
	 *
	 *-------------------------------------------------------------------------*/
	function EventDispatcher() {

		/**
		* creating event listener
		* @param type 		event name
		* @param handler 	event handler
		* @param context 	event handler context (if not defined, window)
		*/
		this.addEventListener = function(type, handler, context) {
			var event;
			for (var i = 0, n=Event.eventList.length; i<n; i++) {
				event = Event.eventList[i];
				if (event && event.type === type && event.target === this && event.handler === handler) {
					return;
				}
			}
			Event.eventList.push({"type":type, "target":this, "context":context, "handler":handler});
		};

		/**
		* removing event listener
		* @param type 		event name
		* @param handler 	event handler
		*/
		this.removeEventListener = function(type, handler) {
			var event;
			for (var i = 0, n=Event.eventList.length; i<n; i++) {
				event = Event.eventList[i];
				if (event && event.type === type && event.target === this && event.handler === handler) {
					event.target = null;
					Event.eventList.splice(i,1);
					break;
				}
			}
		};
	};

	/**
	* dispatching event
	* @param event {Event} 	event object
	*/
	this.dispatchEvent = function(event) {
		var type = event.type;
		var evt;
		var currentTarget;
		var handler;
		for (var i=0, n=Event.eventList.length; i<n; i++) {
			evt = Event.eventList[i];
			if (evt && evt.type && evt.type === type && evt.target && evt.target === this) {
				handler = evt.handler;
				event.currentTarget = evt.context || window;
				handler.call(event.currentTarget, event);
			}
		}
	};	

	//////////////////////////////////////////////
	var CallBackHelper = {
		findFunction : function(str) {
			if (str.indexOf(".") >= 0) {
				var parr = str.split(".");
				var fcn = window;
				try {
					for (var i = 0; i < parr.length; i++) {
						fcn = fcn[parr[i]];
						if (fcn == undefined)
							return undefined;
					}
				} catch(e) {
						return undefined;
				}
				return fcn;
			} else
				return window[str];
		}
	};
	
	
	/*--------------------------------------------------------------------------
	 *
	 * Utils Obejct
	 *
	 *-------------------------------------------------------------------------*/
	var Utils = {
		dataUriToBlob : function(dataURI,fileName) {
			var byteString;
			if (dataURI.split(',')[0].indexOf('base64') >= 0) {
				byteString = atob(dataURI.split(',')[1]);
			} else {
				byteString = unescape(dataURI.split(',')[1]);
			}

		    // parsing the mime type
			var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
		
		    // constructing a Blob of the image data
			var array = [];
			for (var i = 0; i < byteString.length; i++) {
				array.push(byteString.charCodeAt(i));
			}
			var b;
			try {
				b = new Blob([new Uint8Array(array)],{type: mimeString},{name:fileName});
			} catch(e) {
				window.BlobBuilder = window.BlobBuilder || 
									 window.WebKitBlobBuilder || 
									 window.MozBlobBuilder || 
									 window.MSBlobBuilder;
				if (e.name == 'TypeError' && window.BlobBuilder) {
					var bb = new BlobBuilder();
					trace([new Uint8Array(array)]);
					bb.append([new Uint8Array(array)]);
					var b = bb.getBlob("image/jpeg");
				}
				else if (e.name == "InvalidStateError") {
					var b = new Blob( [array.buffer], {type : "image/jpeg"});
				}
				else {
					trace("BLOB Error");
				}
			}
		    return b;
		},

		getDate : function() {
			var str = "";	
			var d = new Date();

			str = this.zeroPad(d.getFullYear(),4) +
				  this.zeroPad(d.getMonth()+1,2) +
				  this.zeroPad(d.getDate(),2) +
				  this.zeroPad(d.getHours(),2) +
				  this.zeroPad(d.getMinutes(),2) +
				  this.zeroPad(d.getSeconds(),2) ;

			return str;
		},

		formatFileSize : function(numSize) {
			var str = "";
			numSize = Number(numSize/1024);
			str = numSize.toFixed(1) + " K";
			if (numSize > 1024) {
				numSize = numSize / 1024;
				str = numSize.toFixed(1) + " M";
				if (numSize > 1024) {
					numSize = numSize / 1024;
					str = numSize.toFixed(1) + " G";
				}
			}
			return str;
		},
		// padding 0 (if (89, 4), returns 0089)
		zeroPad : function(number, width) {
			var ret = ""+number;
			while (ret.length < width)
				ret="0" + ret;
			return ret;
		},

		// sorting by key-value
		sortOn : function() {
			var dup = this.slice();
			if (!arguments.length) return dup.sort();
			var args = Array.prototype.slice.call(arguments);
			return dup.sort(function(a,b) {
				var props = args.slice();
				var prop = props.shift();
				while(a[prop] == b[prop] && props.length) prop = props.shift();
				return a[prop] == b[prop] ? 0 : a[prop] > b[prop] ? 1 : -1;
			});
		},

		// setting the all values of sobj to obj
		extend : function(obj, sobj) {
			if (!obj) {
				obj = {};
			}
			for (var i in sobj) {
				obj[i] = sobj[i];
			}
			return obj;
		},

		// setting CSS
		css : function(el, styles) {
			if (KoolFileManager.isIE) {
				if (styles && styles.opacity !== undefined) {
					styles.filter = 'alpha(opacity='+ (styles.opacity * 100) +')';
				}
			}
			this.extend(el.style, styles);
		},

		// getting the element which has a specific class name
		hasClass : function(name, type, parent) {
			var r = [];
			var re = new RegExp(name);
			var p = parent || document;
			var e = p.getElementsByTagName(type || "*");
			for (var j=0; j<e.length; j++) {
				if (re.test(e[j].className))
					r.push(e[j]);
			}
			return r;
		},

		// creating an element
		createElement : function(eleName, className, boxType) {
			var ele = document.createElement(eleName);
			ele.className = className;
			if (eleName === "div")
				ele.style[boxSizing] = boxType || "content-box";
			return ele;
		},

		// setting a style
		setStyle : function(elem, name, value) {
			if(cssStyleList[name])
				name = cssStyleList[name];
			elem.style[name] = value;
		},

		// getting a style value
		getStyle : function(elem, name) {
			var v;
			if (elem.style[name])
				v = elem.style[name];
			else if(document.defaultView && document.defaultView.getComputedStyle) {
				name = name.replace(/([A-Z])/g, "-$1");
				name = name.toLowerCase();

				var s = document.defaultView.getComputedStyle(elem,"");
				v = s && s.getPropertyValue(name);

				// finding the internal style names (e.g. border-width --> boder-top-width)
				if (v == "") {
					name = name.replace(/\-/g, "-top-");
					v = s && s.getPropertyValue(name);
				}
			} else {
				v = null;
			}

			if (typeof v === "string" && v.indexOf("px") > 0 ) {
				v = Number(v.replace(/px/, ''));
			}
			if (v == "auto" || ( !isString(v) && isNaN2(v))) {
				v = 0;
			}
			return v;
		},

		// finding the X coordinate
		pageX : function(elem) {
			var p = 0;

			while (elem.offsetParent) {
				p += elem.offsetLeft; 		// adding the parent offset
				p -= elem.scrollLeft; 		// subtracting the parent scrollLeft
				elem = elem.offsetParent; 	// next parent
			}

			return p;
		},

		// finding the Y coordinate
		pageY : function(elem) {
			var p = 0;

			while (elem.offsetParent) {
				p += elem.offsetTop; 		// adding the parent offset
				p -= elem.scrollTop; 		// subtracting the parent scrollTop
				elem = elem.offsetParent; 	// next parent
			}

			return p;
		},

		// getting the X coordinate based on the parent node
		relativeX : function(elem) {
			return elem.parentNode === elem.offsetParent ? elem.offetLeft :
					this.pageX(elem) - this.pageX(elem.parentNode);
		},

		// getting the Y coordinate based on the parent node
		relativeY : function(elem) {
			return elem.parentNode === elem.offsetParent ? elem.offetTop :
					this.pageY(elem) - this.pageY(elem.parentNode);
		},

		// getting the height of element
		getHeight : function(elem) {
			return parseInt(this.getStyle(elem, "height"));
		},

		// getting the width of element
		getWidth : function(elem) {
			return parseInt(this.getStyle(elem, "width"));
		},

		// checking if a child(eChild) exists in a parent (eParent) in DOM
		isParentOf : function(eParent,eChild) {
			try {
				if (document.compareDocumentPosition) {
					return !!(eParent.compareDocumentPosition(eChild)&16);
				} else if (document.body.contains) {
					return (eParent !== eChild)&&(eParent.contains ? eParent.contains(eChild) : true);
				} else {
					var e  = eParent;
					var el = eChild;

					while(e && e.parentNode) {
						e = e.parentNode;
						if (e == el) return true;
					}
					return false;
				}
			} catch(e) {};

			return false;
		},

		// for using ajax
		serialization : function(e) {
			var s = [];

			if (e.constructor == Array) {
				for(var i = 0 ; i < e.length ; i++ ) {
					s.push(e[i].name + "=" + encodeURIComponent(e[i].value));
				}
			} else {
				for (var j in e) {
					s.push(j + "=" + encodeURIComponent(e[j]));
				}
			}
			return "?"+s.join("&");
		},

		per2pix : function(parentValue, value ) {
			value = value.replace(/%/,"") * 0.01 * parentValue;
			return value;
		},
		
		per2Num : function(value) {
			return Number(value.replace(/%/,""));
		},
		
		clone : function(obj, deep) { 
			if (!obj)
				return null;
			var objectClone = new obj.constructor(); 
			for (var property in obj) { 
				if (!deep) 
					objectClone[property] = obj[property]; 
				else if (typeof obj[property] == 'object') 
					objectClone[property] = Utils.clone(obj[property],deep); 
				else 
					objectClone[property] = obj[property];
			} 
			return objectClone; 
		}
	};	
	
	//-----------------------------------------------------------------
	//
	// Ajax
	//
	//------------------------------------------------------------------

	// #7653, #8125, #8152: local protocol detection  from jqeury by HS
	var rlocalProtocol = /^(?:about|app|app\-storage|.+\-extension|file|widget):$/;
	var rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/;

	// Document location
	var ajaxLocation;

	// Document location segments
	var ajaxLocParts;

	// #8138, IE may throw an exception when accessing
	// a field from window.location if document.domain has been set
	try {
		ajaxLocation = location.href;
	} catch(e) {
		// Use the href attribute of an A element
		// since IE will modify it given document.location
		ajaxLocation = document.createElement( "a" );
		ajaxLocation.href = "";
		ajaxLocation = ajaxLocation.href;
	}

	ajaxLocParts = rurl.exec( ajaxLocation.toLowerCase() ) || [];

	var isLocal = rlocalProtocol.test( ajaxLocParts[ 1 ] );

	function ajax(options) {
		var target = options.target ? options.target : null;
		var currentTarget = options.currentTarget ? options.currentTarget : null;

		options = {
			type : options.type || "GET",
			url : options.url || "",
			timeout : options.timeout || 30000,
			//onComplete : options.onComplete || function() {},
			onError : options.onError || function() {},
			onSuccess : options.onSuccess || function() {},
			data : options.data || "",
			sendData : options.sendData || "",
			progress : options.progress,
			load : options.load,
			loadstart : options.loadstart,
			loadendend : options.loadendend,
			sendOption : options.sendOption,
			abort : options.abort
		};

		var i, xhr,
			activeXids = ['MSXML2.XMLHTTP.3.0', 'MSXML2.XMLHTTP', 'Microsoft.XMLHTTP'];

		if (window.ActiveXObject || "ActiveXObject" in window) {
			
			if (isLocal) {
				//xhr = new ActiveXObject("Microsoft.XMLHTTP");
			}
		}

		if (!xhr) {
			try {
				xhr = new XMLHttpRequest();
			} catch(e) {
				for (i=0; i<activeXids.length; i++) {
					try {
						xhr = new ActiveXObject(activeXids[i]);
						break;
					} catch(e) {}
				}
			}
		}

		//ajax.upload.addEventListener("progress", progressHandler, false);
		
		var timeoutLength = options.timeout;
		var requestDone = false;

		setTimeout(function() {
			requestDone = true;
		}, timeoutLength);
		
		var axhr = xhr.upload || xhr;
		//addEvent(axhr,"progress",options.progress);
		axhr.onprogress = function(e) {
			e.data = options.sendData;
			e.sendOption = options.sendOption;
			if (_uploader.inUpload) {
				options.progress(e);
			}		
		}

		axhr.onload = options.load;
		axhr.onloadstart = options.loadstart;
		axhr.onloadendend = options.loadendend;
		//addEvent(xhr.upload,"progress",options.progress);
		xhr.onreadystatechange = function() {
			
			if (xhr.readyState == 4 && !requestDone) {
				
				var targets = {};
				if(target)
					targets.target = target;
				if (currentTarget)
					targets.currentTarget = currentTarget;
				if (httpSuccess(xhr)) {
					var ct = xhr.getResponseHeader("content-type");
					var data;
					if (ct && ct.indexOf("xml") >= 0) {
						if (/msie/i.test(navigator.userAgent) && !window.opera) {
							if (xhr.responseXML.xml !== undefined) {
								data = Parser.load(xhr.responseXML.xml);
							} else {
								data = xhr.responseXML;
							}
						} else {
							data = xhr.responseXML;
						}
					} else {
						data = xhr.responseText;
					}
					_uploader.uploadedFileCount++;
					if (_uploader.inUpload) {
						options.onSuccess(data,options.sendData,options.isLast);
					} else {
						options.onCancel();
					}
				} else {
					options.onError(xhr.status,targets);
				}
				xhr = null;
			}
		};

		try {
			xhr.open(options.type, options.url, true);
			var formData = new FormData();
			for (var key in options.sendData.formdata) {
				if (options.sendData.formdata.fileName) {
					try {
						formData.append(key, options.sendData.formdata[key],options.sendData.formdata.fileName);
					} catch(e) {
						formData.append(key, options.sendData.formdata[key]);
					}
				} else {
					formData.append(key, options.sendData.formdata[key]);
				}
			}
			xhr.send(formData);
			return xhr;
		}catch(e) {
			options.onError(e.message);
		}

		function httpSuccess(r) {
			try {
				return !r.status && isLocal || (r.status >= 200 && r.status < 300) ||
					r.status == 304 || navigator.userAgent.indexOf("Safari") >= 0 && isNull(r.status);
			} catch(e) {}
			return false;
		};
	};
	
	//-----------------------addEvent, removeEvent -----------
	// written by Dean Edwards, 2005
	// with input from Tino Zijdel, Matthias Miller, Diego Perini
	// http://dean.edwards.name/weblog/2005/10/add-event/
	function addEvent(element, type, handler) {
		if (element !== window)
			ElementManager.insert(element);
		if (element.addEventListener) {
			element.addEventListener(type, handler, false);
			
		} else {
			// assign each event handler a unique ID
			if (!handler.$$guid) handler.$$guid = addEvent.guid++;
			// create a hash table of event types for the element
			if (!element.events) element.events = {};
			// create a hash table of event handlers for each element/event pair
			var handlers = element.events[type];
			if (!handlers) {
				handlers = element.events[type] = {};
				// store the existing event handler (if there is one)
				if (element["on" + type]) {
					handlers[0] = element["on" + type];
				}
			}
			// store the event handler in the hash table
			handlers[handler.$$guid] = handler;
			// assign a global event handler to do all the work
			element["on" + type] = handleEvent;
		}
		if (!element._$events) {
			element._$events = {"type":type, "handler":handler};
		}
	};
	// a counter used to create unique IDs
	addEvent.guid = 1;

	function removeEvent(element, type, handler) {
		if (element.removeEventListener) {
			element.removeEventListener(type, handler, false);
		} else {
			// delete the event handler from the hash table
			if (element.events && element.events[type]) {
				delete element.events[type][handler.$$guid];
			}
		}
	};

	function handleEvent(event) {
		var returnValue = true;
		// grab the event object (IE uses a global event object)
		event = event || fixEvent(((this.ownerDocument || this.document || this).parentWindow || window).event);
		// get a reference to the hash table of event handlers
		var handlers = this.events[event.type];
		// execute each event handler
		for (var i in handlers) {
			this.$$handleEvent = handlers[i];
			if (!this.$$handleEvent(event)) {
				returnValue = false;
			}
		}
		return returnValue;
	};

	function fixEvent(event) {
		// add W3C standard event methods
		event.preventDefault = fixEvent.preventDefault;
		event.stopPropagation = fixEvent.stopPropagation;

		// Fix target property, if necessary
		if (!event.target) {
			// Fixes #1925 where srcElement might not be defined either
			event.target = event.srcElement || document;
		}

		// check if target is a textnode (safari)
		if (event.target.nodeType === 3) {
			event.target = event.target.parentNode;
		}

		// Add relatedTarget, if necessary
		if (!event.relatedTarget && event.fromElement) {
			event.relatedTarget = event.fromElement === event.target ? event.toElement : event.fromElement;
		}

		// Calculate pageX/Y if missing and clientX/Y available
		if (event.pageX == null && event.clientX != null) {
			var eventDocument = event.target.ownerDocument || document,
				doc = eventDocument.documentElement,
				body = eventDocument.body;

			event.pageX = event.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
			event.pageY = event.clientY + (doc && doc.scrollTop  || body && body.scrollTop  || 0) - (doc && doc.clientTop  || body && body.clientTop  || 0);
		}

		// Add which for key events
		if (event.which == null && (event.charCode != null || event.keyCode != null)) {
			event.which = event.charCode != null ? event.charCode : event.keyCode;
		}

		// Add metaKey to non-Mac browsers (use ctrl for PC's and Meta for Macs)
		if (!event.metaKey && event.ctrlKey) {
			event.metaKey = event.ctrlKey;
		}

		// Add which for click: 1 === left; 2 === middle; 3 === right
		// Note: button is not normalized, so don't use it
		if (!event.which && typeof event.button !== undefined) {
			event.which = (event.button & 1 ? 1 : ( event.button & 2 ? 3 : ( event.button & 4 ? 2 : 0 ) ));
		}
		return event;
	};

	fixEvent.preventDefault = function() {
		this.returnValue = false;
	};

	fixEvent.stopPropagation = function() {
		this.cancelBubble = true;
	};

	addEvent(window, "unload", function() {
		try {
			var i, n = Event.eventList.length;
			for ( i = 0 ; i < n ; i += 1) {
				event = Event.eventList[i];
				event.target = null;
			}
			Event.eventList = [];
			
			var roots = Utils.hasClass(elementClassName + "Root");
			var root;
			for(i=0, n=roots.length; i<n; i++) {
				root = roots[i];
				if(isFunction(root.chart.destroy))
					root.chart.destroy();
				root.chart = null;
				root.layout = root.data = null;
				root.httpService = null;
				root.orgWidth = root.orgHeight = null;
				root.dataUrlRequested = null;
				root.layoutUrlRequested = null;
				root.setLayout = null;
				root.setData = null;
				root.setLayoutURL = null;
				root.setDataURL = null;
				root.setLayoutData = null;
				root.setSlideLayoutSet = null;
				root.slideLayout = null;
				root.slideData = null;
				root.createChartImage = null;
				root.createSlideButton = null;
				root.currentData = null;
				root.setSlideDataSet = null;
				root.slideOutImage = null;
				root.isEffect = null;
				root.chartImg = null;
				root.withSeriesImg = null;
				root.btnWidth = null;
				root.btnHeight = null;
				root.legendAllCheck = null;
				root.showAdditionalPreloader = null;
				root.removeAdditionalPreloader = null;
				root.resize = null;
				root.getSnapshot = null;
				root.excanvasWrapDiv = null;
				root.visibleItemSize = null;
				root.hasNoData = null;
				root.changeScrollBarSize = null;
			}
		} catch(e) {}
	});
}());