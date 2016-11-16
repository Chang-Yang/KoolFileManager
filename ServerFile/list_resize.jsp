<%@page import="javax.imageio.ImageIO"%>
<%@page import="java.awt.image.BufferedImage"%>
<%@page import="javax.imageio.ImageReader"%>
<%@page import="java.io.IOException"%>
<%@page import="java.io.File" %>
<%@page import="java.io.*" %>
<%@page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%
	request.setCharacterEncoding("UTF-8");
	String realPath = request.getRealPath("/TestUpload");

	File dirFile = new File(realPath);
	File[] fileList = dirFile.listFiles();
	
	for(File tempFile : fileList) {
		if(tempFile.isFile()) {
			String tempPath=tempFile.getParent();
			String tempFileName=tempFile.getName();
   
			String str = tempFile.toString();
			try {
				BufferedImage bimg = ImageIO.read(tempFile);
				int w = bimg.getWidth();
				int h = bimg.getHeight();	   
				str += "  /  width : "+w+"  height : "+h;
			} catch(Exception e) {
				str += "  is not an image file.";
			}
			
		out.println("<div>"+str+"</div>");
		out.println("");
    /*** Do something withd tempPath and temp FileName ^^; ***/
  }

}
%>