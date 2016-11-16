<%@page import="java.util.*"%>
<%@page import="java.io.*"%>
<%@page import="org.apache.commons.fileupload.*"%>
<%@page import="org.apache.commons.io.*"%>
<%@page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%
	final String realPath = request.getRealPath("/TestUpload");		// 
	final String tempPath = request.getRealPath("/TestUpload");		// Saving to Temporary File
	request.setCharacterEncoding("UTF-8");
	response.addHeader("Access-Control-Allow-Origin","*");
	response.addHeader("Access-Control-Allow-Credentials","true");
	Enumeration names = request.getHeaderNames();
	
	String header  = "";
	if(request.getParameter("isBig")!=null){
		System.out.println("isBig = "+request.getParameter("isBig")+" , title : "+request.getParameter("title"));
	}
	while(names.hasMoreElements()){
		header = (String) names.nextElement();
	}
 
	DiskFileUpload upload = new DiskFileUpload();

	boolean isMultipart = upload.isMultipartContent(request);
	if (!isMultipart) {
		System.out.println("is not a multipart content");
		return;
	}
	
	upload.setSizeMax(-1);												// Max Upload File Size
	upload.setSizeThreshold(4096);								// Max Memory Size
	upload.setRepositoryPath(tempPath);						// Temporary File Directory

	List fileItems = upload.parseRequest(request);
	Iterator iter = fileItems.iterator();
	FileItem item;
	String generateFileID = null;
	
	iter = fileItems.iterator();
	while (iter.hasNext()) {
		item = (FileItem)iter.next();
	
		if (item.isFormField()) {										// If not input type="file"
			if ("generateFileID".equals(item.getFieldName()))
			generateFileID = item.getString();
		}
	
		if (!item.isFormField()) {										// If input type="file"
			if ("FileData".equals(item.getFieldName())) {	// The value of the uploadFieldName attribute (Uploader Component)
				System.out.println(item.toString());
				String fileName = item.getName();			// File Name with Path
				fileName = fileName.substring(fileName.lastIndexOf("\\")+1);		// File Name (Path Removed)

				long fileSize = item.getSize();				// File Size
			
				String savedFileName;
				if (generateFileID == null)
					savedFileName = fileName;
				else
				//savedFileName = fileName+"_"+generateFileID;
				savedFileName = fileName;
			
				File f = new File(realPath + "/" + savedFileName);
				item.write(f);
				out.write(savedFileName + "||" + fileName);
			}
		}
	}
%>
