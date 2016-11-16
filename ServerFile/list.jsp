<%@page import="java.io.File" %>
<%@page import="java.io.*" %>
<%@page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%
	request.setCharacterEncoding("UTF-8");
	String realPath = request.getRealPath("/TestUpload");
	
	File dirFile=new File(realPath);
	File[] fileList=dirFile.listFiles();
	
	for(int c = 0; c < fileList.length; c++) {
		if(fileList[c].isFile()) {
			String str = fileList[c].getName();
			out.println("<div>"+str+"</div>");
			out.println("");
	  }
	}
%>