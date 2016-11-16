<%@page import="java.io.File"%>
<%@page import="java.io.*"%>
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=EUC-KR">
</head>
<body>
<% 
	String fileName = request.getParameter("fileName");
	String saveFolder = "/TestUpload" ;
	String filePath = request.getRealPath(saveFolder + "/" + fileName);
  
	try {
		File file = new File(filePath);
		if(file.exists()) {
			byte b[] = new byte[4096];
	   
			response.reset();
			response.setContentType("application/octet-stream");
	   
			String Encoding = new String(fileName.getBytes("UTF-8"), "8859_1");
			response.setHeader("Content-Disposition", "attachment; filename = " + Encoding);
	  
			FileInputStream in = new FileInputStream(filePath);
	   
			out.clear(); 
			out=pageContext.pushBody();
	
			ServletOutputStream out2 = response.getOutputStream();
	   
			int numRead;
			while((numRead = in.read(b, 0, b.length)) != -1){
				out2.write(b, 0, numRead);
			}   
			out2.flush();
			out2.close();
			in.close();
		} else {
			System.out.println("No File");
		}
	} catch(Exception e){
  }
%>
</body>
</html>