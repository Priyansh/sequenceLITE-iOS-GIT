// JavaScript Document

/**********   Global Variable  **********/
var builderName, projectName, lotNo, projNO, Master_FKNo, CSID_No, txtuserName;
var viewedlastProjectName, myCalEvents, calCount = 0 , countBuilderList = 0, measuringImage = {}, strMeasuringImg = [],map, mapLocationFailed,ForecastDate="",ModelName = "", ModelType = "", LayoutDoneUser = "";
var album =0,imageFileName="",totalImageLength=0,imageCounter=0;
var LayoutInfo

$(document).ready(function(){

    document.body.style.marginTop = "20px"; //io7+ device overlaying issue
    fillCmbBuilderList();
  
    $("#cmbBuilder, #builderList").change(function(){
        if($("#cmbBuilder option:selected").index() > 0)
        {
            var reqProjectId = false;
            $("#cmbProject option").remove();
            $("#cmbProject").append('<option>---Project List---</option>');
            $("#cmbLot option").remove();
            $("#cmbLot").append('<option>---Lot List---</option>');
            builderName = $('#cmbBuilder option:selected').text();
            fillCmbProjectList(builderName);
        }
        else
        {
            $("#cmbProject option").remove();
            $("#cmbProject").append('<option>---Project List---</option>');
            $("#cmbLot option").remove();
            $("#cmbLot").append('<option>---Lot List---</option>');
        }

        if($("#builderList option:selected").index() > 0)
        {
            $("#projectList option").remove();
            $("#projectList").append('<option>---Project List---</option>');
            builderName = $('#builderList option:selected').text();
            fillCmbProjectList(builderName);
        }
        else
        {
            $("#projectList option").remove();
            $("#projectList").append('<option>---Project List---</option>');
        }
    });

    $("#cmbProject").change(function(){
        projNO =0;	
        if($("#cmbProject option:selected").index() > 0)
        {
            $("#cmbLot option").remove();
            $("#cmbLot").append('<option>---Lot List---</option>');
            projNO = getProjNumber($('#cmbBuilder option:selected').text(),$('#cmbProject option:selected').text());
            fillCmbLotList(projNO,"option1");
        }
        else
        {
            $("#cmbBuilder option").remove();
            $("#cmbBuilder").append('<option>---Builder List---</option>');
            fillCmbBuilderList();
            $("#cmbProject option").remove();
            $("#cmbProject").append('<option>---Project List---</option>');
        }
    });
    
    $("#projectList").change(function(){
	projNO =0;
	if($("#projectList option:selected").index() > 0)
        {
	    builderName = $('#builderList option:selected').text();
	    projectName = $('#projectList option:selected').text();
            projNO = getProjNumber($('#builderList option:selected').text(),$('#projectList option:selected').text());
            fillAddress(projNO);
            fillContactList(projNO);
            fillFrendelReps(projNO);
            fillProjectStatus(projNO);
	    //fillProjectSchedule(projNO);
	    googleMap(1);
	    calCount = 0;  //Again Reinitialize, when dropdown selection has been changed
	    $("#divfullCalendar").fullCalendar('destroy');
	    $('.orderInfoDisplay').text( builderName + " / " + projectName );
        }
        else
        {	    
            $("#builderList option").remove();
            $("#builderList").append('<option>---Builder List---</option>');
            fillCmbBuilderList();
            $("#projectList option").remove();
            $("#projectList").append('<option>---Project List---</option>');
	    //resetProjectSelection();
	    $("#tblProjSchedule").empty();
        }
    });

    $("#cmbViewedProject").change(function(){
        projNO =0;
        $("#cmbViewedProjLot option").remove();
        $("#cmbViewedProjLot").append('<option>---Viewed Project Lot List---</option>');
        if($("#cmbViewedProject option:selected").index() > 0)
        {
            viewedlastProjectName = $("#cmbViewedProject option:selected").text().split("/");
            if(viewedlastProjectName.length > 2)
            {
              projNO = getLast10ViewedProjectNumber(viewedlastProjectName[1] + "/" + viewedlastProjectName[2]); 
            }
            else
            {
             projNO = getLast10ViewedProjectNumber(viewedlastProjectName[1]);
            }
        }
        fillCmbLotList(projNO,"option3");
    });

    /* inBuilt Keyboard "Go" button clicked*/
    $('#frmSearchFK').on('submit', function(event){
        searchFKNO();
        return false;
    });

    $("#btnClearFkNo").on('click', function(event){
        $("#txtSearchFKNo").val("");
    });

    //Login button Click event
    $("#frmLogin").on('submit', function(event) {
        txtuserName = $("#uname").val();
        var txtpwd = $("#pwd").val();
        if (txtuserName != "" && txtpwd != "") {
         Process_Login(txtuserName, txtpwd);
	 applicationUsage(txtuserName);
         $("#uname").val("");
         $("#pwd").val("");
        }
        else
        {
	 $('#alertMessage').html("Please enter the correct UserName or Password"); $('#alertBox').modal();
         $("#uname").focus();
        }
        return false;
    });
 
    //Progress bar initialization
    $(".prog").css({"width" : "0%"});
    $(".prog").text("0%");
    
    $("#btnInspectionPhoto").on("click", function(e){
	$("#txtImageTitle,#txtImageComment").val("Inspection Photo");	
	navigator.camera.getPicture(onSuccessImageTaken, onFailImageTaken,
		{quality:100,
		destinationType: navigator.camera.DestinationType.FILE_URI,
		sourceType : navigator.camera.PictureSourceType.CAMERA,
		targetWidth: 400, targetHeight: 400,
		encodingType: navigator.camera.EncodingType.JPEG,
		allowEdit: false,
		saveToPhotoAlbum : true
		});	

    });
    
    $("#btnImageCaptured").on("click", function(e){
	if ($("#txtImageTitle").val().length === 0 || $("#txtImageComment").val().length === 0) {
	  $('#alertMessage').html("Please add title or comment"); $('#alertBox').modal();
	}
	else{
	navigator.camera.getPicture(onSuccessImageTaken, onFailImageTaken,
		{quality:100,
		destinationType: navigator.camera.DestinationType.FILE_URI,
		sourceType : navigator.camera.PictureSourceType.CAMERA,
		targetWidth: 400, targetHeight: 400,
		encodingType: navigator.camera.EncodingType.JPEG,
		allowEdit: false,
		saveToPhotoAlbum : true
		});
	}

    });
    
    $("#btnImageAlbum").on("click", function(e){
        if ($("#txtImageTitle").val().length === 0 || $("#txtImageComment").val().length === 0) {
	  $('#alertMessage').html("Please add title or comment"); $('#alertBox').modal();
	}else{
	  //blackberry.io.sandbox = false;
	  window.imagePicker.getPictures(
                function(results) {
		  var resultLength = results.length, j=0;
		  var imgs = [];
		  totalImageLength = results.length; //This global variable utilize in this insertMultipleImage function
                    for (var i = 0; i < results.length; i++) {                        
			album = 1;
			$("#loaderpic").css({display: "block"});
			insertImagetoDB(results[i]);			
			/*window.resolveLocalFileSystemURI(results[i], function(fileEntry){			    
			    imageFileName = fileEntry.name;
			    if (resultLength <= results.length && resultLength != 0) {			      
			      insertImagetoDB(results[j]);
			      j++;			      
			    }			    
			    resultLength = resultLength - 1;			    
			}); */			
		    }		    
		}, function (error) {
			  alert('Error: ' + error);
			}, {
			    maximumImagesCount: 5			      
			   }
            );
	//  navigator.camera.getPicture(onSuccessImageTaken, onFailImageTaken,
	//	{quality:100,
	//	destinationType: navigator.camera.DestinationType.FILE_URI,
	//	sourceType : navigator.camera.PictureSourceType.PHOTOLIBRARY,
	//	targetWidth: 400, targetHeight: 400,
	//	encodingType: navigator.camera.EncodingType.JPEG,
	//	allowEdit: false
	//	});
	}

    });
    displayCalendar();

    $("#btnPrev").click(function(){
	if ($("#builderList option:selected").index() > 0 && $("#projectList option:selected").index() > 0) {
	    $("#divfullCalendar").fullCalendar("prev");
	    calendarEventsLoad();
	}
	else{
	    $('#alertMessage').html("Please select builder and project from the list"); $('#alertBox').modal();
	}
    });
    $("#btnToday").click(function(){
	if ($("#builderList option:selected").index() > 0 && $("#projectList option:selected").index() > 0) {
	    $("#divfullCalendar").fullCalendar("today");
	    calendarEventsLoad();
	}
	else{	    
	    $('#alertMessage').html("Please select builder and project from the list"); $('#alertBox').modal();
	}
	
    });
    $("#btnNext").click(function(){
	 if ($("#builderList option:selected").index() > 0 && $("#projectList option:selected").index() > 0) {
	    $("#divfullCalendar").fullCalendar("next");
	    calendarEventsLoad();
	}
	else{	    
	    $('#alertMessage').html("Please select builder and project from the list"); $('#alertBox').modal();
	}
    });
    
    $( "#dateFrom , #date1From , #dateShipping, #date2From, #dateOrderCompleted" ).datepicker();
    $( "#dateTo , #date1To, #date2To" ).datepicker();
    
    $("#btnTotalDef").click(function () {
      if ($("#dateFrom").val().length === 0 || $("#dateTo").val().length === 0) {
	$('#alertMessage').html("Please select From or To Date"); $('#alertBox').modal();
      }
      else{		    	    	    
	    generateTotalDefReport();	    
      }
    });
    
    $("#btnTonyDash").click(function () {
      if ($("#date1From").val().length === 0 || $("#date1To").val().length === 0) {
	$('#alertMessage').html("Please select From or To Date"); $('#alertBox').modal();
      }
      else{	
	generateTonyDashReport();	    
      }
    });
    
    $("#btnShipping").click(function () {
      generateShippingReport();      
    });

    $("#lnkEmailPDF").click(function(){    	
    	downloadLayout();

    	/*cordova.plugins.email.isAvailable(
		    function (isAvailable) {
		        console.log("is available");
		    }
		);*/

    	/*cordova.plugins.email.open({
			to: '',
			subject: 'test subject',
			body:'',
			isHTML: false
		}); */
    });

    /* Pinch Zoom In / Zoom Out  */
	/*var myScroll = new IScroll('#divViewLayout', {
		zoom: true,
	    scrollX: true,
	    scrollY: true,
	    mouseWheel: true,
	    wheelAction: 'zoom'    
	});*/
	/* End of Pinch Zoom In / Zoom Out  */

}); //End of 'DeviceReady' function

  function loadCurrentDate() {
    $("#dateShipping").datepicker({dateFormat:"mm/dd/yyyy"}).datepicker("setDate",new Date());
    $("#dateOrderCompleted").datepicker({dateFormat:"mm/dd/yyyy"}).datepicker("setDate",new Date());
  }
  
  function generateLast30Days() {
    $("#date2From").datepicker({dateFormat:"mm/dd/yyyy"}).datepicker("setDate","-31");
    $("#date2To").datepicker({dateFormat:"mm/dd/yyyy"}).datepicker("setDate","-1");
  }
  
  function generateTotalDefReport(){
      var options = {	    
	lines: {
	  show: true
	},
	points: {
	  show: true				
	},
	tooltip: true,
	tooltipOpts: {
	  content: "Date: %x, TotalLots: %y",
	  dateFormat: "%m/%d/%Y"
	},
	xaxis: {
	  show: true,
	  mode: "time",
	  timeformat: "%m/%d/%Y",
	  minTickSize: [1, "day"],
	  axisLabel: "Date",
	  tickDecimals: 0,
	  axisLabelPadding: 70
	  //tickSize: 1
	},
	yaxis : {
	  show: true,
	  tickDecimals: 0,
	  axisLabel: "TotalLots",
	  position : "left"	      
	},
	grid: {
	  hoverable: true,
	  borderWidth: 2,
	  backgroundColor: { colors: ["#ffffff", "#EDF5FF"] }
	}	    
      };
      var dataReport = [];	    
      var FDate = $("#dateFrom").val();
      var TDate = $("#dateTo").val();			
      // Find the URL in the link right next to us, then fetch the data	    	    
      $.support.cors= true;
      $.ajax({
	  //url: "http://192.168.3.76:53435/phonegap.asmx/spKP_TotalDefReport",
	  url: "http://ws.frendel.com/mobile/phonegap.asmx/spKP_TotalDefReport",			    
	  contentType: 'application/json;charset=utf-8',
	  type: "POST",
	  data: JSON.stringify({FromDate:FDate,ToDate:TDate}),
	  async:false,
	  dataType: "json",
	  success : function(msg)  {
	      var totalDefInfo = msg.d;
	      for(i=0;i<totalDefInfo.length;i++)
	      {
		var series_X = {			  
		  "def" : [totalDefInfo[i].coordinates_X,totalDefInfo[i].coordinates_Y] 
		}		      
		dataReport.push(series_X.def);		      		      
	      }
	      $.plot($("#flotTotalDefPlaceholder"), [dataReport], options);		    
	  },
	  error: function(e){
	  $('#alertMessage').html("error: Failed to call WebService for total def report"); $('#alertBox').modal();
	  }
      });
  }
  
  function generateTonyDashReport() {
    var ticks = [[0, "Measured"], [1, "Layout"], [2, "Shipped"]];
    var options = {	    
	bars: {
	  show: true,
	  barWidth: 0.8,
	  align: "center"
	},
	tooltip: true,
	tooltipOpts: {
	    content: "TotalLots: %y"	    
	},
	xaxis: {
	  axisLabel: "Task",
	  axisLabelUseCanvas: true,
          axisLabelFontSizePixels: 12,
          axisLabelFontFamily: 'Verdana, Arial',
          axisLabelPadding: 70,	  	  
	  ticks: ticks
	},
	yaxis : {	  	  
	  axisLabel: "TotalLots",
	  axisLabelUseCanvas: true,
          axisLabelFontSizePixels: 12,
          axisLabelFontFamily: 'Verdana, Arial',
          axisLabelPadding: 3	      
	},
	grid: {
	  hoverable: true,
	  borderWidth: 2,
	  backgroundColor: { colors: ["#ffffff", "#EDF5FF"] }
	}	    
      };
      var dataReport = [];
      var dataset = [];
      var FDate = $("#date1From").val();
      var TDate = $("#date1To").val();			

      $.support.cors= true;
      $.ajax({
	  //url: "http://192.168.3.76:53435/phonegap.asmx/spKP_TonyDashReport",
	  url: "http://ws.frendel.com/mobile/phonegap.asmx/spKP_TonyDashReport",			    
	  contentType: 'application/json;charset=utf-8',
	  type: "POST",
	  data: JSON.stringify({FromDate:FDate,ToDate:TDate}),
	  async:false,
	  dataType: "json",
	  success : function(msg)  {
	      var tonyDashInfo = msg.d;
	      var taskID = 0;
	      /*for(i=0;i<tonyDashInfo.length;i++)
	      {
		if (tonyDashInfo[i].coordinate_X === "Measured") {taskID = 0;}
		else if (tonyDashInfo[i].coordinate_X === "Layout") {taskID = 1;}
		else if (tonyDashInfo[i].coordinate_X === "Shipped") {taskID = 2;}
		var series_X = {			  
		  "def" : [taskID,tonyDashInfo[i].coordinates_Y],		  
		}		
		dataReport.push(series_X.def);
		dataset = [{ label: "Measured", data: dataReport, color: "green" },
			   { label: "Layout", data: dataReport, color: "blue" },
			   { label: "Shipped", data: dataReport, color: "yellow" }];
		$.plot($("#flotTonyDashPlaceholder"), dataset, options);
	      }*/
	      dataset = [{ label: "Measured", data: [[0,tonyDashInfo[0].coordinates_Y]], color: "green" },
			   { label: "Layout", data: [[1,tonyDashInfo[1].coordinates_Y]], color: "blue" },
			   { label: "Shipped", data: [[2,tonyDashInfo[2].coordinates_Y]], color: "yellow" }];
	      $.plot($("#flotTonyDashPlaceholder"), dataset, options);
	  },
	  error: function(e){
	  $('#alertMessage').html("error: Failed to call WebService for dashboard report"); $('#alertBox').modal();
	  }
      });
  }
  
  function generateShippingReport(){
    var shippingDate = $("#dateShipping").val(); 
    var columns = [
      {id: "mNo", name: "Master No", field: "masterNo", width: 120, resizable: false},
      {id: "comp", name: "Company", field: "company", width: 220, resizable: false, sortable: true},
      {id: "proj", name: "Project", field: "project", width: 220, resizable: false},
      {id: "lot", name: "Lot", field: "lot", width: 120, resizable: false},
      {id: "shiptime", name: "Ship Time", field: "shiptime", width: 80, resizable: false},
      {id: "expectedship", name: "Expected Ship", field: "expectedShip", width: 120, resizable: false, sortable: true},
      {id: "shipper", name: "Shipper", field: "shipper", width: 90, resizable: false}
    ];
  
    var options = {
      enableCellNavigation: true,
      enableColumnReorder: false,
      rowHeight: 50,
      multiColumnSort: true
    };
    
    $.support.cors= true;    
    $.ajax({
      url: "http://ws.frendel.com/mobile/phonegap.asmx/spKPTracking_Shipping",
      //url: "http://192.168.3.76:53435/phonegap.asmx/spKPTracking_Shipping",
      contentType: 'application/json;charset=utf-8',
      type: "POST",
      data: JSON.stringify({date:shippingDate}),
      async:false,
      dataType: "json",
      success : function(msg)  {
	var shippingList = msg.d;
	var data = [];
	for(i=0; i<shippingList.length; i++)
	{
	  data[i] = {
	    masterNo: shippingList[i].MasterNo,
	    company: shippingList[i].Company,
	    project: shippingList[i].Project,
	    lot: shippingList[i].LotName,
	    shiptime: shippingList[i].ShipTime,
	    expectedShip: shippingList[i].ExpectedShip,
	    shipper: shippingList[i].Shipper
	  };
	}    
      var grid = new Slick.Grid("#grdShippingReport", data, columns, options);
      grid.onSort.subscribe(function (e, args) {
	var cols = args.sortCols;
	data.sort(function (dataRow1, dataRow2) {
	  for (var i = 0, l = cols.length; i < l; i++) {
	    var field = cols[i].sortCol.field;
	    var sign = cols[i].sortAsc ? 1 : -1;
	    var value1 = dataRow1[field], value2 = dataRow2[field];
	    var result = (value1 == value2 ? 0 : (value1 > value2 ? 1 : -1)) * sign;
	    if (result != 0) {
	      return result;
	    }
	  }
	  return 0;
	});
	grid.invalidate();
	grid.render();
      });
      },
      error: function(xhr, errorThrown, textStatus){	
	  $('#alertMessage').html("error: Failed to call WebService for shipping report due to" +  " " + textStatus); $('#alertBox').modal();
      }
    });
  }
  
  function generateRecentInstallations(){ 
    var columns = [
      {id: "mNo", name: "Master No", field: "masterNo", width: 120, resizable: false},
      {id: "comp", name: "Company", field: "company", width: 220, resizable: false, sortable: true},
      {id: "proj", name: "Project", field: "project", width: 220, resizable: false},
      {id: "lot", name: "Lot", field: "lot", width: 90, resizable: false},
      {id: "installdate", name: "InstallDate", field: "installdate", width: 100, resizable: false, sortable: true},
      {id: "installer", name: "Installer", field: "installer", width: 100, resizable: false, sortable: true},
      {id: "shipdate", name: "ShipDate", field: "shipdate", width: 100, resizable: false, sortable: true},
      {id: "inspectiondate", name: "InspectionDate", field: "inspectiondate", width: 120, resizable: false, sortable: true},
      {id: "inspector", name: "Inspector", field: "inspector", width: 100, resizable: false}
    ];
  
    var options = {
      enableCellNavigation: true,
      enableColumnReorder: false,
      rowHeight: 50,
      multiColumnSort: true
    };
    
    $.support.cors= true;    
    $.ajax({
      url: "http://ws.frendel.com/mobile/phonegap.asmx/spKP_RecentInstallation",
      //url: "http://192.168.3.76:53435/phonegap.asmx/spKP_RecentInstallation",
      contentType: 'application/json;charset=utf-8',
      type: "POST",
      data: JSON.stringify({}),
      async:false,
      dataType: "json",
      success : function(msg)  {
	var installationList = msg.d;
	var data = [];
	for(i=0; i<installationList.length; i++)
	{
	  data[i] = {
	    masterNo: installationList[i].MasterNo,
	    company: installationList[i].Company,
	    project: installationList[i].Project,
	    lot: installationList[i].LotName,
	    installdate: installationList[i].InstallDate,
	    installer: installationList[i].Installer,
	    shipdate: installationList[i].ShipDate,
	    inspectiondate: installationList[i].InspectionDate,
	    inspector: installationList[i].Inspector
	  };
	}
	
	data.getItemMetadata = function (row) {
	    if (this[row].inspectiondate.length > 0){
		return {
		  'cssClasses': 'highlight-color'
		};
	    }
	    return null;
	};
      var grid = new Slick.Grid("#grdRecentInstallations", data, columns, options);
      grid.onSort.subscribe(function (e, args) {
	var cols = args.sortCols;
	data.sort(function (dataRow1, dataRow2) {
	  for (var i = 0, l = cols.length; i < l; i++) {
	    var field = cols[i].sortCol.field;
	    var sign = cols[i].sortAsc ? 1 : -1;
	    var value1 = dataRow1[field], value2 = dataRow2[field];
	    var result = (value1 == value2 ? 0 : (value1 > value2 ? 1 : -1)) * sign;
	    if (result != 0) {
	      return result;
	    }
	  }
	  return 0;
	});
	grid.invalidate();
	grid.render();
      });
      },
      error: function(xhr, errorThrown, textStatus){	
	  $('#alertMessage').html("error: Failed to call WebService for recent installation report due to" +  " " + textStatus); $('#alertBox').modal();
      }
    });
  }
  
  function generateOutstandingInstallations(){ 
    var columns = [
      {id: "mNo", name: "Master No", field: "masterNo", width: 120, resizable: false},
      {id: "comp", name: "Company", field: "company", width: 220, resizable: false, sortable: true},
      {id: "proj", name: "Project", field: "project", width: 220, resizable: false},
      {id: "lot", name: "Lot", field: "lot", width: 90, resizable: false},
      {id: "shipdate", name: "ShipDate", field: "shipdate", width: 100, resizable: false, sortable: true},
      {id: "projectedinstall", name: "ProjectedInstall", field: "projectedinstall", width: 120, resizable: false, sortable: true},
      {id: "shipper", name: "Shipper", field: "shipper", width: 100, resizable: false},
      {id: "assignperson", name: "Assignperson", field: "assignperson", width: 100, resizable: false}
    ];
  
    var options = {
      enableCellNavigation: true,
      enableColumnReorder: false,
      rowHeight: 50,
      multiColumnSort: true
    };
    
    $.support.cors= true;    
    $.ajax({
      url: "http://ws.frendel.com/mobile/phonegap.asmx/spKP_OutstandingInstallation",
      //url: "http://192.168.3.76:53435/phonegap.asmx/spKP_OutstandingInstallation",
      contentType: 'application/json;charset=utf-8',
      type: "POST",
      data: JSON.stringify({}),
      async:false,
      dataType: "json",
      success : function(msg)  {
	var installationList = msg.d;
	var data = [];
	for(i=0; i<installationList.length; i++)
	{
	  data[i] = {
	    masterNo: installationList[i].MasterNo,
	    company: installationList[i].Company,
	    project: installationList[i].Project,
	    lot: installationList[i].LotName,
	    shipdate: installationList[i].ShipDate,
	    projectedinstall: installationList[i].ProjectedInstall,
	    shipper: installationList[i].Shipper,
	    assignperson: installationList[i].AssignPerson
	  };
	}    
      var grid = new Slick.Grid("#grdOutstandingInstallations", data, columns, options);
      grid.onSort.subscribe(function (e, args) {
	var cols = args.sortCols;
	data.sort(function (dataRow1, dataRow2) {
	  for (var i = 0, l = cols.length; i < l; i++) {
	    var field = cols[i].sortCol.field;
	    var sign = cols[i].sortAsc ? 1 : -1;
	    var value1 = dataRow1[field], value2 = dataRow2[field];
	    var result = (value1 == value2 ? 0 : (value1 > value2 ? 1 : -1)) * sign;
	    if (result != 0) {
	      return result;
	    }
	  }
	  return 0;
	});
	grid.invalidate();
	grid.render();
      });
      },
      error: function(xhr, errorThrown, textStatus){	
	  $('#alertMessage').html("error: Failed to call WebService for outstanding installation report due to" +  " " + textStatus); $('#alertBox').modal();
      }
    });
  }
  
  function generateRequiredLayout(){  
    var columns = [
      {id: "mNo", name: "Master No", field: "masterNo", width: 120, resizable: false},
      {id: "comp", name: "Company", field: "company", width: 220, resizable: false, sortable: true},
      {id: "proj", name: "Project", field: "project", width: 220, resizable: false},
      {id: "lot", name: "Lot", field: "lot", width: 90, resizable: false},
      {id: "measured", name: "Measured", field: "measured", width: 100, resizable: false, sortable: true},
      {id: "colors", name: "Colors", field: "colors", width: 100, resizable: false, sortable: true},
      {id: "layoutDate", name: "RequiredDate", field: "layoutDate", width: 120, resizable: false, sortable: true}
    ];
  
    var options = {
      enableCellNavigation: true,
      enableColumnReorder: false,
      rowHeight: 50,
      multiColumnSort: true
    };
    
    $.support.cors= true;    
    $.ajax({
      url: "http://ws.frendel.com/mobile/phonegap.asmx/spKP_RequiredLayout",
      //url: "http://192.168.3.76:53435/phonegap.asmx/spKP_RecentInstallation",
      contentType: 'application/json;charset=utf-8',
      type: "POST",
      data: JSON.stringify({}),
      async:false,
      dataType: "json",
      success : function(msg)  {
	var layoutList = msg.d;
	var data = [];
	for(i=0; i<layoutList.length; i++)
	{
	  data[i] = {
	    masterNo: layoutList[i].MasterNo,
	    company: layoutList[i].Company,
	    project: layoutList[i].Project,
	    lot: layoutList[i].LotName,
	    measured: layoutList[i].Measured,
	    colors: layoutList[i].Colors,
	    layoutDate: layoutList[i].LayoutRequiredDate
	  };
	}    
      var grid = new Slick.Grid("#grdRequiredLayout", data, columns, options);
      grid.onSort.subscribe(function (e, args) {
	var cols = args.sortCols;
	data.sort(function (dataRow1, dataRow2) {
	  for (var i = 0, l = cols.length; i < l; i++) {
	    var field = cols[i].sortCol.field;
	    var sign = cols[i].sortAsc ? 1 : -1;
	    var value1 = dataRow1[field], value2 = dataRow2[field];
	    var result = (value1 == value2 ? 0 : (value1 > value2 ? 1 : -1)) * sign;
	    if (result != 0) {
	      return result;
	    }
	  }
	  return 0;
	});
	grid.invalidate();
	grid.render();
      });
      },
      error: function(xhr, errorThrown, textStatus){	
	  $('#alertMessage').html("error: Failed to call WebService for required layout report due to" +  " " + textStatus); $('#alertBox').modal();
      }
    });
    
  }
  
  function generateTotalLayoutByPerson() {      
      var dataset = [];
      var FDate = $("#date2From").val();
      var TDate = $("#date2To").val();
      $.support.cors= true;
      $.ajax({
	  //url: "http://192.168.3.76:53435/phonegap.asmx/spKP_TotalLayoutByPerson",
	  url: "http://ws.frendel.com/mobile/phonegap.asmx/spKP_TotalLayoutByPerson",			    
	  contentType: 'application/json;charset=utf-8',
	  type: "POST",
	  data: JSON.stringify({FromDate:FDate,ToDate:TDate}),
	  async:false,
	  dataType: "json",
	  success : function(msg)  {
	      var totalLayoutByPerson = msg.d;
	      var taskID = 0;	      
	      var ticksData = [];
	      for(i=0;i<totalLayoutByPerson.length;i++){
		ticksData.push([i,totalLayoutByPerson[i].LayoutPerson_X]);		
		dataset.push({data : [[i,totalLayoutByPerson[i].TotalLayoutDone_Y]]});		
	      }
	      
	      var options = {	    
		  bars: {
		    show: true,
		    barWidth: 0.4,
		    align: "center"
		  },
		  tooltip: true,
		  tooltipOpts: {
		    content: "TotalLayouts: %y"	    
		  },
		  xaxis: {
		    axisLabel: "Layout Person",
		    axisLabelUseCanvas: true,
		    axisLabelFontSizePixels: 12,
		    axisLabelFontFamily: 'Verdana, Arial',
		    axisLabelPadding: 70,	  	  
		    ticks: ticksData,
		    tickLength: 0
		  },
		  yaxis : {	  	  
		    axisLabel: "TotalLayouts",
		    axisLabelUseCanvas: true,
		    axisLabelFontSizePixels: 12,
		    axisLabelFontFamily: 'Verdana, Arial',
		    axisLabelPadding: 3	      
		  },
		  grid: {
		    hoverable: true,
		    borderWidth: 2,
		    backgroundColor: { colors: ["#ffffff", "#EDF5FF"] }
		  }	    
		};
	      $.plot($("#flotTotalLayoutsPlaceholder"), dataset, options);
	  },
	  error: function(e){
	  $('#alertMessage').html("error: Failed to call WebService for dashboard report"); $('#alertBox').modal();
	  }
      });
  }
  
  function generateProductionCompleted(){
    var orderDate = $("#dateOrderCompleted").val(); 
    var columns = [
      {id: "mNo", name: "Order", field: "masterNo", width: 120, resizable: false},
      {id: "consolidate", name: "Company - Project - Lot - Phase", field: "columnConsolidate", width: 400, resizable: false, sortable: true},
      {id: "doors", name: "Doors", field: "doors", width: 80, resizable: false}      
    ];
  
    var options = {
      enableCellNavigation: true,
      enableColumnReorder: false,
      rowHeight: 50,
      multiColumnSort: true
    };
    var TotalDoors=0,TotalOrders=0;
    $.support.cors= true;    
    $.ajax({
      url: "http://ws.frendel.com/mobile/phonegap.asmx/spKPTracking_CabinetsComplete",
      //url: "http://192.168.3.76:53435/phonegap.asmx/spKPTracking_CabinetsComplete",
      contentType: 'application/json;charset=utf-8',
      type: "POST",
      data: JSON.stringify({date:orderDate}),
      async:false,
      dataType: "json",
      success : function(msg)  {
	var orderCompletionList = msg.d;
	var data = [];	
	for(i=0; i<orderCompletionList.length; i++)
	{
	  data[i] = {
	    masterNo: orderCompletionList[i].MasterNo,
	    columnConsolidate: orderCompletionList[i].Company + "-" + orderCompletionList[i].Project + "-" + orderCompletionList[i].LotName + "-" + orderCompletionList[i].Phase,
	    doors: orderCompletionList[i].Doors	    
	  };
	  TotalDoors += orderCompletionList[i].Doors;
	  TotalOrders++;
	}
      $("#lblTotalOrders").text(TotalOrders);
      $("#lblTotalDoors").text(TotalDoors);
      var grid = new Slick.Grid("#grdOrderCompleted", data, columns, options);
      grid.onSort.subscribe(function (e, args) {
	var cols = args.sortCols;
	data.sort(function (dataRow1, dataRow2) {
	  for (var i = 0, l = cols.length; i < l; i++) {
	    var field = cols[i].sortCol.field;
	    var sign = cols[i].sortAsc ? 1 : -1;
	    var value1 = dataRow1[field], value2 = dataRow2[field];
	    var result = (value1 == value2 ? 0 : (value1 > value2 ? 1 : -1)) * sign;
	    if (result != 0) {
	      return result;
	    }
	  }
	  return 0;
	});
	grid.invalidate();
	grid.render();
      });
      },
      error: function(xhr, errorThrown, textStatus){	
	  $('#alertMessage').html("error: Failed to call WebService for shipping report due to" +  " " + textStatus); $('#alertBox').modal();
      }
    });
  }
  function insertMultipleImage(lotParams){	  	  
	  window.setTimeout($.ajax({
	    url: "http://ws.frendel.com/mobile/phonegap.asmx/spKP_InsertImageToLOTDB",
            //url: "http://192.168.3.76:53435/phonegap.asmx/spKP_InsertImageToLOTDB",
            contentType: 'application/json;charset=utf-8',
            type: "POST",
            data: JSON.stringify({LotList:lotParams}),
            async:false,
	    cache: false,
            dataType: "json",
            success : function(msg){
              var successStatus = msg.d;
	      if (totalImageLength > 0) {				
		if (totalImageLength === 1) {
		  $("#loaderpic").css({display: "none"});
		  $("#txtImageTitle").val("");
		  $("#txtImageComment").val("");		  
		}
		totalImageLength--;
	      }	      
            },
            error: function(xhr, errorThrown, textStatus){            
	    $('#alertMessage').html("error: Failed to call WebService for inserting image due to" + " " + textStatus); $('#alertBox').modal();
	    $("#loaderpic").css({display: "none"});
            }
	  }),200);	  
	  displayAttachment(CSID_No);	 
  }
function insertSingleImage(lotParams){
	  $.support.cors= true;
	  $.ajax({
	    url: "http://ws.frendel.com/mobile/phonegap.asmx/spKP_InsertImageToLOTDB",
            //url: "http://192.168.3.76:53435/phonegap.asmx/spKP_InsertImageToLOTDB",
            contentType: 'application/json;charset=utf-8',
            type: "POST",
            data: JSON.stringify({LotList:lotParams}),
            async:false,	  
            dataType: "json",
            success : function(msg){
              var successStatus = msg.d;	     
            },
            error: function(xhr, errorThrown, textStatus){            
	    $('#alertMessage').html("error: Failed to call WebService for inserting image due to" + " " + textStatus); $('#alertBox').modal();
	    $("#loaderpic").css({display: "none"});
            }
	  });
	  displayAttachment(CSID_No);
	  $("#txtImageTitle").val("");
	  $("#txtImageComment").val("");
}
  
  function insertImagetoDB(imageURI) {
    var img = new Image();    
    img.onload = function () {
	var imageData;
	var canvas = document.createElement("canvas");
	var ctx = canvas.getContext("2d");
	canvas.width = img.width;
	canvas.height = img.height;	
	ctx.drawImage(img, 0, 0,img.width,img.height);

	var dataURL = canvas.toDataURL("image/jpg");
	imageData = dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
	//Cleaning
	img.src = "";
	canvas=null;img=null;ctx=null;
	
	var fileName = $("#txtImageTitle").val();
	var comment = $("#txtImageComment").val();
	var lotParams;
	lotParams = {
	    UserName : txtuserName,
	    CSID_Number : CSID_No,
	    FileData : imageData,
	    FileName : fileName,
	    Comment : comment
	}
	if (album === 0) {	
	  insertSingleImage(lotParams);	  
	}
	else{	  
	  var currentYear = new Date();
	  imageCounter ++;
	  imageFileName = fileName + "_" + imageCounter + "_" + currentYear.getFullYear();	  
	  lotParams.FileName = imageFileName;
	  insertMultipleImage(lotParams);
	}
	
    };    
  img.src = imageURI;
  
}

function onSuccessImageTaken(imageURI){
    album = 0;
    insertImagetoDB(imageURI);
}
function onFailImageTaken(failMsg) {    
    $('#alertMessage').html("Failed to Capture Image : " + failMsg); $('#alertBox').modal();
}

//Fetching number of days in particular month of year AND "Month is 1 based"
function daysInMonth(month,year) {
    return new Date(year, month, 0).getDate();
}
function calendarEventsLoad()
{
    $('#divfullCalendar').fullCalendar('removeEvents');
    var mydate = $("#divfullCalendar").fullCalendar("getDate");
    var month = mydate.getMonth()+1;
    var years = mydate.getFullYear();
    var totalDaysInMonth = daysInMonth(month,years);
    for(var days=1;days<=totalDaysInMonth;days++)
    {
      var customDate = month + "/" + days + "/" + years;
      calendarEventsAJAX(customDate, false);
    }
}
function calendarEventsAJAX(customDate, eventClickRec) {
    var CalendarInfo;
    $.ajax({
	    url: "http://ws.frendel.com/mobile/phonegap.asmx/spGetProjectSelection_FullCalendarByProjNo",
	    //url: "http://192.168.3.76:53435/phonegap.asmx/spGetProjectSelection_FullCalendarByProjNo",
	    contentType: 'application/json;charset=utf-8',
	    type: "POST",
	    data: JSON.stringify({proj_No:projNO,dateVal:customDate}),
	    async:false,
	    dataType: "json",
	    success : function(msg){
		CalendarInfo = msg.d;
		var myCalEvents = [];
		if (CalendarInfo.length > 0 && !eventClickRec) {
		    for(tblId=0; tblId < CalendarInfo.length; tblId++) {
			var alertCreateOnce = 0;
			for(tblType=0;tblType <CalendarInfo[tblId].length; tblType++)
			{
			    if (CalendarInfo[tblId][tblType].Installed != "") {
				tmp1 = {
				    title : "Installation",
				    start : CalendarInfo[tblId][tblType].Installed,
				    installed : CalendarInfo[tblId][tblType].Installed,
				    customDateDisplay : CalendarInfo[tblId][tblType].CustomDateDisplay
				};
				if (alertCreateOnce === 0) {myCalEvents.push(tmp1); }
				alertCreateOnce = 1;
			    }
			    else if (CalendarInfo[tblId][tblType].DateMeasured != "") {
				tmp2 = {
				    title : "Measuring",
				    start : CalendarInfo[tblId][tblType].DateMeasured,
				    dateMeasured : CalendarInfo[tblId][tblType].DateMeasured,
				    customDateDisplay : CalendarInfo[tblId][tblType].CustomDateDisplay
				};
				if (alertCreateOnce === 0) {myCalEvents.push(tmp2); }
				alertCreateOnce = 1;
			    }
			    else if (CalendarInfo[tblId][tblType].ShipDate != "") {
				tmp3 = {
				    title : "Shipping",
				    start : CalendarInfo[tblId][tblType].ShipDate,
				    shipDate : CalendarInfo[tblId][tblType].ShipDate,
				    customDateDisplay : CalendarInfo[tblId][tblType].CustomDateDisplay
				};
				if (alertCreateOnce === 0) {myCalEvents.push(tmp3); }
				alertCreateOnce = 1;
			    }
			    else if (CalendarInfo[tblId][tblType].ServiceSchedule != "") {
				tmp4 = {
				    title : "Service",
				    start : CalendarInfo[tblId][tblType].ServiceSchedule,
				    serviceSchedule : CalendarInfo[tblId][tblType].ServiceSchedule,
				    customDateDisplay : CalendarInfo[tblId][tblType].CustomDateDisplay
				};
				if (alertCreateOnce === 0) {myCalEvents.push(tmp4); }
				alertCreateOnce = 1;
			    }
			} // end of inner for loop
		    } // end of main for loop

		    $("#divfullCalendar").fullCalendar('addEventSource', myCalEvents);
		}
	    },
	    error: function(e){		
		$('#alertMessage').html("error: Failed to call WebService for Calendar events"); $('#alertBox').modal();
	    }
	}); // End of ajax request
     return CalendarInfo;
}
function displayCalendar(){
    //Display Calendar
    $("#btnDispCalendar").click( function(event) {
	if ($("#builderList option:selected").index() > 0 && $("#projectList option:selected").index() > 0){
	    event.preventDefault();
	    if (calCount === 0) {
		var cal =$("#divfullCalendar").fullCalendar({
		    header: {
			left : '',
			center: 'title',
			right : ''
		    },
		    eventRender: function (event, element) {
			element.attr('href', 'javascript:void(0);');
			element.click(function() {
			    var calendarEventInfo, tblHeadCreated = false;
			    $('#tblCalenEventsDetails').empty();

			    if (event.title === "Installation") {
				calendarEventInfo =calendarEventsAJAX(event.installed, true);
				$('#modalTitle').html(event.title + " for " + event.customDateDisplay);

				if(calendarEventInfo.length > 0)
				{
				    if(tblHeadCreated === false){
					var th;
					th =  '<tr>';
					th += '<th>' + " LOT " + '</th>';
					th += '<th>' + " Installed " + '</th>';
					th += '<th>' + " MASTERNUM " + '</th>';
					th += '<th>' + " ShippedDone " + '</th>';
					th += '<th>' + " Installer " + '</th>';
					th += '</tr>';
					tblHeadCreated = true;
					$("#tblCalenEventsDetails").append(th);
					$("#tblCalenEventsDetails").appendTo("#modalBody");
				    }

				    for(tblId=0; tblId<calendarEventInfo.length; tblId++)
				    {
					for(tblType=0;tblType <calendarEventInfo[tblId].length; tblType++)
					{
					    if (calendarEventInfo[tblId][tblType].Installed != "") {
						var tr ='<tr>';
						tr += '<td>' + calendarEventInfo[tblId][tblType].LOT + '</td>';
						tr += '<td>' + calendarEventInfo[tblId][tblType].Installed + '</td>';
						tr += '<td>' + calendarEventInfo[tblId][tblType].MasterNum + '</td>';
						tr += '<td>' + calendarEventInfo[tblId][tblType].Shipped_Done + '</td>';
						tr += '<td>' + calendarEventInfo[tblId][tblType].Installer + '</td>';
						tr += '</tr>';
						$("#tblCalenEventsDetails").append(tr);
						$("#tblCalenEventsDetails").appendTo("#modalBody");
					    }
					}
				    }
				}
				$('#fullCalModal').modal();
			    }
			    else if (event.title === "Measuring") {
				calendarEventInfo =calendarEventsAJAX(event.dateMeasured, true);

				$('#modalTitle').html(event.title + " for " + event.customDateDisplay);
				if(calendarEventInfo.length > 0)
				{
				    if(tblHeadCreated === false){
					var th;
					th =  '<tr>';
					th += '<th>' + " LOT " + '</th>';
					th += '<th>' + " DateMeasured " + '</th>';
					th += '<th>' + " MASTERNUM " + '</th>';
					th += '</tr>';
					tblHeadCreated = true;
					$("#tblCalenEventsDetails").append(th);
					$("#tblCalenEventsDetails").appendTo("#modalBody");
				    }
				    for(tblId=0; tblId<calendarEventInfo.length; tblId++)
				    {
					for(tblType=0;tblType <calendarEventInfo[tblId].length; tblType++)
					{
					    if (calendarEventInfo[tblId][tblType].DateMeasured != "") {
						var tr ='<tr>';
						tr += '<td>' + calendarEventInfo[tblId][tblType].LOT + '</td>';
						tr += '<td>' + calendarEventInfo[tblId][tblType].DateMeasured + '</td>';
						tr += '<td>' + calendarEventInfo[tblId][tblType].MasterNum + '</td>';
						tr += '</tr>';
						$("#tblCalenEventsDetails").append(tr);
						$("#tblCalenEventsDetails").appendTo("#modalBody");
					    }
					}
				    }
				}
				$('#fullCalModal').modal();
			    }
			    else if (event.title === "Shipping") {
				calendarEventInfo =calendarEventsAJAX(event.shipDate, true);
				$('#modalTitle').html(event.title + " for " + event.customDateDisplay);
				if(calendarEventInfo.length > 0)
				{
				    if(tblHeadCreated === false){
					var th;
					th =  '<tr>';
					th += '<th>' + " LOT " + '</th>';
					th += '<th>' + " ShipDate " + '</th>';
					th += '<th>' + " MASTERNUM " + '</th>';
					th += '<th>' + " Shipper " + '</th>';
					th += '</tr>';
					tblHeadCreated = true;
					$("#tblCalenEventsDetails").append(th);
					$("#tblCalenEventsDetails").appendTo("#modalBody");
				    }
				    for(tblId=0; tblId<calendarEventInfo.length; tblId++)
				    {
					for(tblType=0;tblType <calendarEventInfo[tblId].length; tblType++)
					{
					    if (calendarEventInfo[tblId][tblType].ShipDate != "") {
						var tr ='<tr>';
						tr += '<td>' + calendarEventInfo[tblId][tblType].LOT + '</td>';
						tr += '<td>' + calendarEventInfo[tblId][tblType].ShipDate + '</td>';
						tr += '<td>' + calendarEventInfo[tblId][tblType].MasterNum + '</td>';
						tr += '<td>' + calendarEventInfo[tblId][tblType].Shipper + '</td>';
						tr += '</tr>';
						$("#tblCalenEventsDetails").append(tr);
						$("#tblCalenEventsDetails").appendTo("#modalBody");
					    }
					}
				    }
				}
				$('#fullCalModal').modal();
			    }
			    else if(event.title === "Service"){
				calendarEventInfo =calendarEventsAJAX(event.serviceSchedule, true);
				$('#modalTitle').html(event.title + " for " + event.customDateDisplay);
				if(calendarEventInfo.length > 0)
				{
				    if(tblHeadCreated === false){
					var th;
					th =  '<tr>';
					th += '<th>' + " LOT " + '</th>';
					th += '<th>' + " MASTERNUM " + '</th>';
					th += '<th>' + " ServiceMan " + '</th>';
					th += '<th>' + " ScheduleTime " + '</th>';
					th += '</tr>';
					tblHeadCreated = true;
					$("#tblCalenEventsDetails").append(th);
					$("#tblCalenEventsDetails").appendTo("#modalBody");
				    }
				    for(tblId=0; tblId<calendarEventInfo.length; tblId++)
				    {
					for(tblType=0;tblType <calendarEventInfo[tblId].length; tblType++)
					{
					    if (calendarEventInfo[tblId][tblType].ServiceSchedule != "") {
						var tr ='<tr>';
						tr += '<td>' + calendarEventInfo[tblId][tblType].LOT + '</td>';
						tr += '<td>' + calendarEventInfo[tblId][tblType].MasterNum + '</td>';
						tr += '<td>' + calendarEventInfo[tblId][tblType].ServiceMan + '</td>';
						tr += '<td>' + calendarEventInfo[tblId][tblType].ScheduleTime + '</td>';
						tr += '</tr>';
						$("#tblCalenEventsDetails").append(tr);
						$("#tblCalenEventsDetails").appendTo("#modalBody");
					    }
					}
				    }
				}
				$('#fullCalModal').modal();
			    }
			});
		    }
		});
		calCount++;
	    }

	}
	else{	    
	    $('#alertMessage').html("Please select builder and project from the list"); $('#alertBox').modal();
	}
    });
}

function resetProjectSelection()
{
    // reset Builder
    $("#builderList").val("---Builder List---");
    $("#loader").css({display: "none"});
    // reset Projects
    $("#projectList option").remove();
    $("#projectList").append('<option>---Project List---</option>');
    clearProjectSelection();
    window.location.href = "#projectSelectionPage";
}

function clearProjectSelection()
{    
    //Clear Site Address
    $("#lbltxtRegion").text("");
    $("#lbltxtDeliveryRegion").text("");
    $("#lbltxtAddress").text("");
    $("#lbltxtCity").text("");
    $("#lbltxtPoCode").text("");
    $("#lbltxtPhone").text("");    
    $("#lbltxtFax").text("");
    $("#lbltxtEmail").text("");
    //Clear Site Contact List
    var th;
    th = '<tr>';
    th += '<th>' + " Contact Type " + '</th>';
    th += '<th>' + " Name " + '</th>';
    th += '<th>' + " Phone " + '</th>';
    th += '<th>' + " Phone2 " + '</th>';
    th += '<th>' + " Fax " + '</th>';
    th += '<th>' + " Cell " + '</th>';
    th += '<th>' + " Email " + '</th>';
    th += '</tr>';
    $('#tblSiteContactList').empty();
    $("#tblSiteContactList").append(th);
    var tr ='<tr>';
    tr += '<td colspan="7" class= "no-records">' + "No Records are Found" + '</td>';
    $("#tblSiteContactList").append(tr);
        //Clear Frendel Reps
        $("#txtSales").val("");
        $("#txtServiceOffice").val("");
        $("#txtServiceField").val("");
	//Clear Project Schedule
	$("#tblProjSchedule").empty();
	
        //Clear Project Status
        $("#progMeasured").css({"width" : "0%","color": "red"});
        $("#progMeasured").text("0%");
        
        $("#progLayoutDone").css({"width" : "0%","color": "red"});
        $("#progLayoutDone").text("0%");
    
        $("#progInProduction").css({"width" : "0%","color": "red"});
        $("#progInProduction").text("0%");

        $("#progShipped").css({"width" : "0%","color": "red"});
        $("#progShipped").text("0%");
    
        $("#progInspected").css({"width" : "0%","color": "red"});
        $("#progInspected").text("0%");

        $("#lblTotalLots").text("");
        $("#lblFirstShippingDate").text("");
        $("#lblLastShippingDate").text("");
        $("#lblOutStandingDef").text("");
        $("#lblCompleteDef").text("");
}

function properProjectSelection(){  
  if (($("#builderList").get(0).selectedIndex === 0) || ($("#projectList").get(0).selectedIndex === 0)) {
    $('#alertMessage').html("Please select Builder List or Project List"); $('#alertBox').modal();    
    window.location.href="#projectSelectionPage";
  }
  
}
function projectSchedule(){
  if (($("#builderList").get(0).selectedIndex === 0) || ($("#projectList").get(0).selectedIndex === 0)) {
    $('#alertMessage').html("Please select Builder List or Project List"); $('#alertBox').modal();    
    window.location.href="#projectSelectionPage";
  }
  else{
    fillProjectSchedule(projNO);  
  }
}

function loadURL(url){  
  //window.open(url, '_system');
  window.open(url, '_blank', 'location=yes');
  return false;
}

function fillAddress(projNO)
{    
    $.support.cors= true;
    $.ajax({
	url: "http://ws.frendel.com/mobile/phonegap.asmx/spGetProjectSelectionByProjNo",
        //url: "http://192.168.3.76:53435/phonegap.asmx/spGetProjectSelectionByProjNo",
        contentType: 'application/json;charset=utf-8',
        type: "POST",
        data: JSON.stringify({proj_No:projNO,projSelectionTab:"Address"}),
        async:false,
        dataType: "json",
        success : function(msg)  {
            var AddressInfo = msg.d;
	    var url = AddressInfo[0].strWebsite;
            $("#lbltxtRegion").text(AddressInfo[0].strRegion);
            $("#lbltxtDeliveryRegion").text(AddressInfo[0].strDeliveryeRegion);
            $("#lbltxtAddress").text(AddressInfo[0].strStreetName);
            $("#lbltxtCity").text(AddressInfo[0].strCity);
            //$("#lbltxtProvince").text(AddressInfo[0].strProvince);
            $("#lbltxtPoCode").text(AddressInfo[0].strPostal);
            //$("#lbltxtCountry").text(AddressInfo[0].strCountry);
            $("#lbltxtPhone").text(AddressInfo[0].strPhone);
            $("#lbltxtFax").text(AddressInfo[0].strFax);
            $("#lbltxtEmail").text(AddressInfo[0].strEmail);	    	    
	    $("#pWebsite").html("<a href='#'>"+ url +"</a>");	    
	    $("#pWebsite").click(function(){
	      loadURL(url);
	    });	    
        },
        error: function(e){        
	$('#alertMessage').html("error: Failed to call WebService for Address"); $('#alertBox').modal();
        }
    });
}
function viewLayout()
{
    $.support.cors= true;
    $.ajax({
	url: "http://ws.frendel.com/mobile/phonegap.asmx/spKPRoomLayoutPage",
        //url: "http://192.168.3.76:53435/phonegap.asmx/spKPRoomLayoutPage",
        contentType: 'application/json;charset=utf-8',
        type: "POST",
        data: JSON.stringify({CSIDNo:CSID_No}),
        async:false,
        dataType: "json",
        success : function(msg)  {
        LayoutInfo = msg.d;
	    var imageCount = 0;
	    $("#imgLayout").empty();
	    
	    for(page=0; page<=9;page++){
	      if (LayoutInfo[page].length > 0) {
		imageCount++;
	      }
	    }
	    var image = 1;

	    for(page=0; page<=9;page++){
	      if (LayoutInfo[page].length > 0) {			
		var table = '<table border="1" style="width:100%;height:100%">'; 
		table += '<tr>' + '<td>' + "FRENDEL KITCHENS LIMITED" + '</td>' + '<td colspan="2">' + ForecastDate + '</td>' + '</tr>';
		table += '<tr>' + '<td colspan="3">' + builderName + ' / ' +  projectName  + '</td>' + '</tr>' ;
		table += '<tr>' + '<td>' + 'LOT ' + lotNo + '</td>' + '<td>' + '<b>' + "FK#- " + Master_FKNo + '</b>' + '</td>' + '<td>' + '<b>' + "Image " + image + " Of " + imageCount + '</b>' + '</td>' + '</tr>';		
		table += '<tr>' + '<td>' + "Model:" + ModelName + " " + ModelType + '</td>' + '<td colspan="2">' + "Drawn by: " + LayoutDoneUser + '</td>' + '</tr>';
		table += '</table>';
		var layoutImage = '<img src="data:image/jpeg;base64,' + LayoutInfo[page] + '" >' + "<br/> <br/>";
		$("#imgLayout").append(table);
		$("#imgLayout").append(layoutImage);
		image++;
	      }
	      
	    }
	    
        },
        error: function(e){        
	$('#alertMessage').html("error: Failed to call WebService for Room Layout Page"); $('#alertBox').modal();
        }
    });
}
function downloadLayout(){
	// Default export is a4 paper, portrait, using milimeters for units	
	var doc = new jsPDF();
	var data = [], height = 0;
	var imageCount = 0;
	for(page=0; page<=9;page++){
	    if (LayoutInfo[page].length > 0) {
			imageCount++;
	     }
	 }
	var image = 1;	
	for(page=0; page<=9;page++){
	      if (LayoutInfo[page].length > 0) {				
	      		var imgData = 'data:image/jpeg;base64,' + LayoutInfo[page];
				doc.setFontSize(12);				
				doc.text(15, height + 30, "FRENDEL KITCHENS LIMITED" + "    " + builderName + "  /  " + projectName + "\n" + "LOT  " + lotNo + "		"  +
										"FK#- " + Master_FKNo + "				" + "Image " + image + " Of " + imageCount + "\n" +
										"Model:   " + ModelName + "   " + ModelType + "		" + "Drawn by:    " + LayoutDoneUser);
				doc.addImage(imgData, 15, 40, 180, 160);
				image++;
	      }
	     if(LayoutInfo[page + 1].length > 0) {doc.addPage();}
	}
	var currentDateTime = new Date(new Date().getTime()).toLocaleString();	
	doc.save('Layout_' + currentDateTime +'.pdf');
	//window.location.href = "mailto:?subject=%20&body=";
	//var pdfOutput = doc.output();
	//console.log(pdfOutput);
	
	/*cordova.plugins.email.open({
	    to:          'mail2priyansh@yahoo.com', // email addresses for TO field
	    cc:          '', // email addresses for CC field
	    bcc:         '', // email addresses for BCC field    
	    subject:    'Hello priyansh jspdf email composer testing', // subject of the email
	    body:       'Frendel Kitchens Limited' // email body (for HTML, set isHtml to true)    
	});*/
}

function downloadLayout1(){	
	var doc = new jsPDF();
	var data = [], height = 0;
	var imageCount = 0;
	for(page=0; page<=9;page++){
	    if (LayoutInfo[page].length > 0) {
			imageCount++;
	     }
	 }
	var image = 1;
	var imgData
	for(page=0; page<=9;page++){
	      if (LayoutInfo[page].length > 0) {				
	      		imgData = 'data:image/jpeg;base64,' + LayoutInfo[page];
				doc.setFontSize(12);				
				doc.text(15, height + 30, "FRENDEL KITCHENS LIMITED" + "    " + builderName + "  /  " + projectName + "\n" + "LOT  " + lotNo + "		"  +
										"FK#- " + Master_FKNo + "				" + "Image " + image + " Of " + imageCount + "\n" +
										"Model:   " + ModelName + "   " + ModelType + "		" + "Drawn by:    " + LayoutDoneUser);
				doc.addImage(imgData, 15, 40, 180, 160);
				image++;
	      }
	     if(LayoutInfo[page + 1].length > 0) {doc.addPage();}
	}
	var currentDateTime = new Date(new Date().getTime()).toLocaleString();
	var pdfOutput = doc.output();
	console.log(pdfOutput);
	
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
 
		  console.log("FileSystem Name :" + fileSystem.name);
		  console.log("Root Name :" + fileSystem.root.name);
		  console.log("Full Path : " + fileSystem.root.fullPath);
		 
		   fileSystem.root.getFile("test.pdf", {create: true}, function(entry) {
		      var fileEntry = entry;
		      console.log(entry);
		 	  
		 	  $scope.filepath =  fileEntry.toURL();
			  $scope.filepath = $scope.filepath.replace('file\:\/\/', 'relative://');
			  $scope.emailer($scope.filepath);
			  //  window.location.href = $scope.filepath;

		      entry.createWriter(function(writer) {
		         writer.onwrite = function(evt) {
		         console.log("write success");
		      };
		 
		      console.log("writing to file");
		         writer.write( pdfOutput );
		      }, function(error) {
		         console.log(error);
		      });
		 
		   }, function(error){
		      console.log(error);
		   });
	},
	function(event){
	 console.log( evt.target.error.code );
	});
	$scope.emailer = function(file){
		alert(file);
		cordova.plugins.email.open({
				    to:          'mail2priyansh@yahoo.com', // email addresses for TO field
				    cc:          '', // email addresses for CC field
				    bcc:         '', // email addresses for BCC field    
				    subject:    'Hello priyansh jspdf email composer testing', // subject of the email
				    body:       'Frendel Kitchens Limited', // email body (for HTML, set isHtml to true)
				    attachments : [file]
				});
	}
	//window.location.href = "mailto:?subject=!&body=";
}

function fillContactList(projNO)
{	
        $.support.cors= true;
        $.ajax({
	url: "http://ws.frendel.com/mobile/phonegap.asmx/spGetProjectSelectionByProjNo",
        //url: "http://192.168.3.76:53435/phonegap.asmx/spGetProjectSelectionByProjNo",
        contentType: 'application/json;charset=utf-8',
        type: "POST",
        data: JSON.stringify({proj_No:projNO,projSelectionTab:"SiteContact"}),
        async:false,
        dataType: "json",
        success : function(msg)  {
            var ContactInfo = msg.d;
            var tblHeadCreated = false;
            $('#tblSiteContactList').empty();
                if(ContactInfo.length > 0)
                {
                    for(i=0; i<ContactInfo.length; i++)
                    {
                        if(tblHeadCreated === false){
                            var th;
                            th = '<tr>';
                            th += '<th>' + " Contact Type " + '</th>';
                            th += '<th>' + " Name " + '</th>';
                            th += '<th>' + " Phone " + '</th>';
                            th += '<th>' + " Phone2 " + '</th>';
                            th += '<th>' + " Fax " + '</th>';
                            th += '<th>' + " Cell " + '</th>';
                            th += '<th>' + " Email " + '</th>';
                            th += '</tr>';
                            tblHeadCreated = true;
                            $("#tblSiteContactList").append(th);
                        }
                        var tr ='<tr>';
                        tr += '<td>' + ContactInfo[i].Contact_Type + '</td>';
                        tr += '<td>' + ContactInfo[i].Contact_Name + '</td>';
                        tr += '<td>' + ContactInfo[i].Contact_Phone + '</td>';
                        tr += '<td>' + ContactInfo[i].Contact_Phone2 + '</td>';
                        tr += '<td>' + ContactInfo[i].Contact_Fax + '</td>';
                        tr += '<td>' + ContactInfo[i].Contact_Cell + '</td>';
                        tr += '<td>' + ContactInfo[i].Contact_Email + '</td>';
                        tr += '</tr>';
                        $("#tblSiteContactList").append(tr);
                    }
                }
                else
                {
                    var th;
                    th = '<tr>';
                    th += '<th>' + " Contact Type " + '</th>';
                    th += '<th>' + " Name " + '</th>';
                    th += '<th>' + " Phone " + '</th>';
                    th += '<th>' + " Phone2 " + '</th>';
                    th += '<th>' + " Fax " + '</th>';
                    th += '<th>' + " Cell " + '</th>';
                    th += '<th>' + " Email " + '</th>';
                    th += '</tr>';
                    $("#tblSiteContactList").append(th);
                    var tr ='<tr>';
                    tr += '<td colspan="7" class= "no-records">' + "No Records are Found" + '</td>';
                    $("#tblSiteContactList").append(tr);
                }
        },
        error: function(e){        
	$('#alertMessage').html("error: Failed to call WebService for Contact List"); $('#alertBox').modal();
        }
    });
}

function fillFrendelReps(projNO)
{
    $.support.cors= true;
    $.ajax({
	url: "http://ws.frendel.com/mobile/phonegap.asmx/spGetProjectSelectionByProjNo",
        //url: "http://192.168.3.76:53435/phonegap.asmx/spGetProjectSelectionByProjNo",
        contentType: 'application/json;charset=utf-8',
        type: "POST",
        data: JSON.stringify({proj_No:projNO,projSelectionTab:"FrendRep"}),
        async:false,
        dataType: "json",
        success : function(msg)  {
            var AddressInfo = msg.d;
            for(i=0;i<AddressInfo.length;i++)
            {
                $("#txtSales").val(AddressInfo[i].Sales);
		$("#txtMeasurer").val(AddressInfo[i].Measurer);
                $("#txtServiceOffice").val(AddressInfo[i].ServiceOffice);
                $("#txtServiceField").val(AddressInfo[i].ServiceField);
            }
        },
        error: function(e){
	    $('#alertMessage').html("error: Failed to call WebService for Frendel Reps"); $('#alertBox').modal();
        }
    });
}

function fillProjectStatus(projNO)
{
    $.support.cors= true;
    $.ajax({
	url: "http://ws.frendel.com/mobile/phonegap.asmx/spGetProjectSelectionByProjNo",
        //url: "http://192.168.3.76:53435/phonegap.asmx/spGetProjectSelectionByProjNo",
        contentType: 'application/json;charset=utf-8',
        type: "POST",
        data: JSON.stringify({proj_No:projNO,projSelectionTab:"ProjectStatus"}),
        async:false,
        dataType: "json",
        success : function(msg) {
            var AddressInfo = msg.d;
            var totallots = AddressInfo[0].TotalLots;
            var measured = AddressInfo[0].Measured;
            var layoutDone = AddressInfo[0].LayoutDone;
            var inProduction = AddressInfo[0].InProduction;
            var shipped = AddressInfo[0].Shipped;
            var inspected = AddressInfo[0].Inspected;
            var firstShippingDate = AddressInfo[0].FirstShippingDate;
            var lastShippingDate = AddressInfo[0].LastShippingDate;
            var outstandingDef = AddressInfo[0].OutstandingDeficiencies;
            var completeDef = AddressInfo[0].CompletedDeficiency;
                if(totallots > 0)
                {
                    measured = Math.round((measured * 100)/ totallots);
                    layoutDone = Math.round((layoutDone * 100) / totallots);
                    inProduction = Math.round((inProduction * 100) / totallots);
                    shipped = Math.round((shipped * 100) / totallots);
                    inspected = Math.round((inspected * 100) / totallots);
                }
                measured === 0 ? $("#progMeasured").css({"width" : measured + "%","color": "red"}) : 
                $("#progMeasured").css({"width" : measured + "%","color": "black"});
                $("#progMeasured").text(measured + "%");
                layoutDone === 0 ? $("#progLayoutDone").css({"width" : layoutDone + "%","color": "red"}) : 
                $("#progLayoutDone").css({"width" : layoutDone + "%","color": "black"})
                $("#progLayoutDone").text(layoutDone + "%");

                inProduction === 0 ? $("#progInProduction").css({"width" : inProduction + "%","color": "red"}) : $("#progInProduction").css({"width" : inProduction + "%","color": "black"})
                $("#progInProduction").text(inProduction + "%");
                shipped === 0 ? $("#progShipped").css({"width" : shipped + "%","color": "red"}) :
                $("#progShipped").css({"width" : shipped + "%","color": "black"}) 
                $("#progShipped").text(shipped + "%");
    
                inspected === 0 ? $("#progInspected").css({"width" : inspected + "%","color": "red"}) : $("#progInspected").css({"width" : inspected + "%","color": "black"});
                $("#progInspected").text(inspected + "%");

                $("#lblTotalLots").text(totallots);
                $("#lblFirstShippingDate").text(firstShippingDate);
                $("#lblLastShippingDate").text(lastShippingDate);
                $("#lblOutStandingDef").text(outstandingDef);
                $("#lblCompleteDef").text(completeDef);
        },
        error: function(e){            
	    $('#alertMessage').html("error: Failed to call WebService for Project Stauts"); $('#alertBox').modal();
        }
    });
}

/*function measuringImage_Exist(id_FK, projNO){    
    var projMeasuringImage = "";    
    $.support.cors= true;
    $.ajax({
	url: "http://ws.frendel.com/mobile/phonegap.asmx/spKP_ProjectSchedule",        
	//url: "http://192.168.3.76:53435/phonegap.asmx/spKP_ProjectSchedule",
        contentType: 'application/json;charset=utf-8',
        type: "POST",        
	data: JSON.stringify({proj_No:projNO}),
        async:false,
        dataType: "json",
        success : function(msg)  {
          var projectSchedule = msg.d;
	  for(i=0; i<projectSchedule.length; i++)
	  {
	    if (projectSchedule[i].MasterNum === id_FK) {
	      projMeasuringImage = projectSchedule[i].MeasuringImageTest;
	    }
	  }          
        },
        error: function(xhr, errorThrown, textStatus){            
	    $('#alertMessage').html("error: Failed to call WebService for measuring image" +  " " + textStatus); $('#alertBox').modal();
        }
    });
    return projMeasuringImage;
}*/

function loaderOff(){
  $("#loader").css({display: "none"});
}

function displayMeasuringImage(id_FK, projNO, strMeasuringImg){  
  window.location.href = "#projMeasuringImage";
  //$("#imgMeasuring").attr('src','data:image/jpeg;base64,' + measuringImage_Exist(id_FK, projNO));
  for(i=0;i<strMeasuringImg.length; i++){    
    if (id_FK === strMeasuringImg[i].fkNO) {      
      $("#imgMeasuring").attr('src','data:image/jpeg;base64,' + strMeasuringImg[i].imageEXIST);
    }  
  }
  
}

function fillProjectSchedule(projNO) {
    $("#loader").css({display: "block"});
    $.support.cors= true;
    window.setTimeout($.ajax({
    url: "http://ws.frendel.com/mobile/phonegap.asmx/spKP_ProjectSchedule",
    //url: "http://192.168.3.76:53435/phonegap.asmx/spKP_ProjectSchedule",
    contentType: 'application/json;charset=utf-8',
    type: "POST",
    data: JSON.stringify({proj_No:projNO}),
    async: true,
    cache: false,    
    dataType: "json",
    success : function(msg)  {	
	var projectSchedule = msg.d;
	var tblHeadCreated = false;	
	$("#tblProjSchedule").empty();
	    if(projectSchedule.length > 0)
	    {	      
		for(i=0; i<projectSchedule.length; i++)
		{
		    if(tblHeadCreated === false){
			var th;
			th = '<tr>';
			th += '<th>' + " FK# " + '</th>';
			th += '<th>' + " LOT " + '</th>';
			th += '<th>' + " Forecast " + '</th>';
			th += '<th>' + " SiteRequest " + '</th>';
			th += '<th>' + " Measuring " + '</th>';
			th += '<th>' + " Colours " + '</th>';
			th += '<th>' + " LayoutDone " + '</th>';
			th += '<th>' + " Production " + '</th>';
			th += '<th>' + " Delivery " + '</th>';
			th += '<th>' + " InstalledDate " + '</th>';
			th += '</tr>';
			tblHeadCreated = true;
			$("#tblProjSchedule").append(th);
		    }
		    var tr ='<tr>';
		    tr += '<td>' + projectSchedule[i].MasterNum + '</td>';
		    tr += '<td>' + projectSchedule[i].LOT + '</td>';
		    tr += '<td>' + projectSchedule[i].Forecast + '</td>';
		    tr += '<td>' + projectSchedule[i].SiteRequest + '</td>';		    
		    if (projectSchedule[i].MeasuringImageTest.length > 0 ) {
		      measuringImage = {
			fkNO: projectSchedule[i].MasterNum,
			imageEXIST : projectSchedule[i].MeasuringImageTest
		      }
		      strMeasuringImg.push(measuringImage); 		      
		      tr += '<td style="white-space:nowrap">' + projectSchedule[i].Measuring + " " + '<img src="img/ViewImage.jpg" id="'+ projectSchedule[i].MasterNum +'" alt="_measuringImg" onclick="displayMeasuringImage(id,projNO,strMeasuringImg);"/> '+ '</td>';		      		      
		    }
		    else{		      
		      tr += '<td>' + projectSchedule[i].Measuring + " " + '</td>';
		    }
		    tr += '<td>' + projectSchedule[i].Colours + '</td>';
		    tr += '<td>' + projectSchedule[i].LayoutDone_ProjSchedule + '</td>';
		    tr += '<td>' + projectSchedule[i].Production + '</td>';
		    tr += '<td>' + projectSchedule[i].Delivery + '</td>';
		    tr += '<td>' + projectSchedule[i].InstalledDate + '</td>'; 
		    tr += '</tr>';
		    $("#tblProjSchedule").append(tr);
		}
	    }
	    else
	    {
		var th;
		th = '<tr>';
		th += '<th>' + " FK# " + '</th>';
		th += '<th>' + " LOT " + '</th>';
		th += '<th>' + " Forecast " + '</th>';
		th += '<th>' + " SiteRequest " + '</th>';
		th += '<th>' + " Measuring " + '</th>';
		th += '<th>' + " Colours " + '</th>';
		th += '<th>' + " LayoutDone " + '</th>';
		th += '<th>' + " Production " + '</th>';
		th += '<th>' + " Delivery " + '</th>';
		th += '<th>' + " InstalledDate " + '</th>';
		th += '</tr>';
		$("#tblProjSchedule").append(th);
		var tr ='<tr>';
		tr += '<td colspan="10" class= "no-records">' + "No Records are Found" + '</td>';
		$("#tblProjSchedule").append(tr);
	    }	    
	    window.location.href = "#projSchedule";
    },
    error: function(xhr, errorThrown, textStatus){
	$("#loader").css({display: "none"});	
	$('#alertMessage').html("error: Failed to call WebService for Project Schedule Info due to" +  " " + textStatus); $('#alertBox').modal();
    }    
    }),500);
  
  /******************Grid  ******************/
  /*var imageFormatter = function(){    
    return "<img class='clickableImage' src='img/ViewImage.jpg' /> ";
  };
  
  $("#grdProjSchedule").on("click", "img.clickableImage", function(){
    alert("You clicked me ");
  });
    
    var columns = [
      {id: "mNo", name: "FK#", field: "masterNo", width: 120, resizable: false},
      {id: "lot", name: "LOT", field: "lot", width: 200, resizable: false},
      {id: "forecast", name: "Forecast", field: "forecast", width: 100, resizable: false, sortable: true},
      {id: "siterequest", name: "SiteRequest", field: "siterequest", width: 120, resizable: false, sortable: true},      
      {id: "measuring", name: "Measuring", field: "measuring", width: 120, resizable: false, sortable: true},
      {id: "measuringImg", name: "", field: "Img", width: 20, resizable: false, sortable: false , formatter: imageFormatter},
      {id: "colours", name: "Colours", field: "colours", width: 120, resizable: false, sortable: true},
      {id: "layoutdone", name: "LayoutDone", field: "layoutdone", width: 120, resizable: false, sortable: true},
      {id: "production", name: "Production", field: "production", width: 100, resizable: false, sortable: true},
      {id: "delivery", name: "Delivery", field: "delivery", width: 100, resizable: false, sortable: true},
      {id: "installeddate", name: "InstalledDate", field: "installeddate", width: 120, resizable: false, sortable: true}
    ];
  
    var options = {
      enableCellNavigation: true,
      enableColumnReorder: false,
      rowHeight: 50,
      multiColumnSort: true
    };
    
    $.support.cors= true;    
    window.setTimeout($.ajax({
      url: "http://ws.frendel.com/mobile/phonegap.asmx/spKP_ProjectSchedule",
      //url: "http://192.168.3.76:53435/phonegap.asmx/spKP_ProjectSchedule",
      contentType: 'application/json;charset=utf-8',
      type: "POST",
      data: JSON.stringify({proj_No:projNO}),
      async:true,
      dataType: "json",
      success : function(msg)  {
	var projectSchedule = msg.d;
	var data = [];
	
	for(i=0; i<projectSchedule.length; i++)
	{
	  /*data[i] = {
	    masterNo: projectSchedule[i].MasterNum,
	    lot: projectSchedule[i].LOT,
	    forecast: projectSchedule[i].Forecast,
	    siterequest: projectSchedule[i].SiteRequest,
	    //measuring: projectSchedule[i].Measuring,
	    colours: projectSchedule[i].Colours,
	    layoutdone: projectSchedule[i].LayoutDone_ProjSchedule,
	    production: projectSchedule[i].Production,
	    delivery: projectSchedule[i].Delivery,
	    installeddate: projectSchedule[i].InstalledDate
	  }; */
	  /*var d = (data[i] = {});
	  d["masterNo"] = projectSchedule[i].MasterNum;
	  d["lot"] = projectSchedule[i].LOT;
	  d["forecast"] = projectSchedule[i].Forecast;
	  d["siterequest"] = projectSchedule[i].SiteRequest;
	  
	  if (projectSchedule[i].MeasuringImageTest.length > 0 ) {
	    measuringImage = {
	      fkNO: projectSchedule[i].MasterNum,
	      imageEXIST : projectSchedule[i].MeasuringImageTest
	    }
	    strMeasuringImg.push(measuringImage); 		      
	    //tr += '<td style="white-space:nowrap">' + projectSchedule[i].Measuring + " " + '<img src="img/ViewImage.jpg" id="'+ projectSchedule[i].MasterNum +'" alt="_measuringImg" onclick="displayMeasuringImage(id,projNO,strMeasuringImg);"/> '+ '</td>';
	    d["measuring"]= projectSchedule[i].Measuring + " " ;
	  }
	  else{		      
	    //tr += '<td>' + projectSchedule[i].Measuring + " " + '</td>';
	    d["measuring"]= projectSchedule[i].Measuring;
	  }
	  d["Img"] = "";
	  d["colours"] = projectSchedule[i].Colours;
	  d["layoutdone"] = projectSchedule[i].LayoutDone_ProjSchedule;
	  d["production"] = projectSchedule[i].Production;
	  d["delivery"] = projectSchedule[i].Delivery;
	  d["installeddate"] = projectSchedule[i].InstalledDate;
	}
      var grid = new Slick.Grid("#grdProjSchedule", data, columns, options);
      grid.onSort.subscribe(function (e, args) {
	var cols = args.sortCols;
	data.sort(function (dataRow1, dataRow2) {
	  for (var i = 0, l = cols.length; i < l; i++) {
	    var field = cols[i].sortCol.field;
	    var sign = cols[i].sortAsc ? 1 : -1;
	    var value1 = dataRow1[field], value2 = dataRow2[field];
	    var result = (value1 == value2 ? 0 : (value1 > value2 ? 1 : -1)) * sign;
	    if (result != 0) {
	      return result;
	    }
	  }
	  return 0;
	});
	grid.invalidate();
	grid.render();
      });
      window.location.href = "#projSchedule";
      },
       error: function(xhr, errorThrown, textStatus){
	$("#loader").css({display: "none"});	
	$('#alertMessage').html("error: Failed to call WebService for Project Schedule Info due to" +  " " + textStatus); $('#alertBox').modal();
      }  
    }),500);*/
  
}

function Process_Login(txtuserName,txtpwd){
    $.support.cors= true;
    $.ajax({
	//url: "http://phonegap.asmx/spKP_UserLogin",
	//url: "http://localhost:53435/phonegap.asmx/spKP_UserLogin",
	url: "http://ws.frendel.com/mobile/phonegap.asmx/spKP_UserLogin",
        //url: "http://192.168.3.76:53435/phonegap.asmx/spKP_UserLogin",
        contentType: 'application/json;charset=utf-8',
        type: "POST",
        data: JSON.stringify({User_Name:txtuserName, Password:txtpwd}),
        async:false,
        dataType: "json",
        success : function(msg)  {	    
            var loginData = msg.d;
            if (loginData === true) {
            last10ViewedProjects(txtuserName,0, "", "", true);
            resetAllOrderInformation();
            window.location.href = "#mainInfoMenu";
            }
            else
            {
	     $('#alertMessage').html("Authorization Fail, make sure you have correct information !!!"); $('#alertBox').modal();
             //$("#uname").focus();
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown){           
	   $('#alertMessage').html("error: Failed to call WebService for Login Details : " + errorThrown); $('#alertBox').modal();
        }
    });
}

function applicationUsage(txtuserName){
    $.support.cors= true;
    $.ajax({
	url: "http://ws.frendel.com/mobile/phonegap.asmx/spKP_seqLITEUsage",
        //url: "http://192.168.3.76:53435/phonegap.asmx/spKP_seqLITEUsage",
        contentType: 'application/json;charset=utf-8',
        type: "POST",
        data: JSON.stringify({userName:txtuserName}),
        async:false,
        dataType: "json",
        success : function(msg)  {	    

        },
        error: function(XMLHttpRequest, textStatus, errorThrown){           
	  $('#alertMessage').html("error: Failed to call WebService for application usage : " + errorThrown); $('#alertBox').modal();
        }
    });
}

function resetAllOrderInformation()
{
        // reset Builder
        $("#cmbBuilder").val("---Builder List---");

        // reset Projects
        $("#cmbProject option").remove();
        $("#cmbProject").append('<option>---Project List---</option>');

        // reset LOT for Option 1
        $("#cmbLot option").remove();
        $("#cmbLot").append('<option>---Lot List---</option>');

        // reset search FKNo
        $("#txtSearchFKNo").val("");

        // reset LOT for Option 3
        $("#cmbViewedProjLot option").remove();
        $("#cmbViewedProjLot").append('<option>---Viewed Project Lot List---</option>');
}

function fillCmbBuilderList()
{
    $.support.cors= true;    
    $.ajax({
        //url: "http://10.0.2.2:53435/phonegap.asmx/PutInfo",   //IP For Android Emulator
        //url:"http://localhost:53435/phonegap.asmx/spKP_getBuilderListFromtblBuilder",
	//url:"http://phonegap.asmx/spKP_getBuilderListFromtblBuilder",
	url: "http://ws.frendel.com/mobile/phonegap.asmx/spKP_getBuilderListFromtblBuilder",
        //url: "http://192.168.3.76:53435/phonegap.asmx/spKP_getBuilderListFromtblBuilder", //Note: IP (IPV4) for my Computer using ipconfig, and opening port using inbound rule in "Control Panel-Window Firewall". Add <access origin=".*" /> config.xml and <uses-permission android:name="android.permission.INTERNET" /> in Android.manifest file 
        contentType: 'application/json;charset=utf-8',
        type: "POST",
        data: JSON.stringify({}),
        async:false, 
        dataType: "json",
        success : function(msg)  {
            var builderData = msg.d;	    
            for(var val in builderData)
            {
                $("#cmbBuilder,#builderList").append(function(){
                    $('<option />', {value: val, text: builderData[val]}).appendTo(this);
                });
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown){           
	   $('#alertMessage').html("error: Failed to call WebService cmbBuilder List : " + errorThrown); $('#alertBox').modal();
        }
    });
}

function fillCmbProjectList(builderName)
{
    $.support.cors= true;
    $.ajax({
	url: "http://ws.frendel.com/mobile/phonegap.asmx/spKP_ProjectList",
        //url: "http://192.168.3.76:53435/phonegap.asmx/spKP_ProjectList",
        contentType: 'application/json;charset=utf-8',
        type: "POST",
        data: JSON.stringify({builder_Name:builderName}),
        async:false, 
        dataType: "json",
        success : function(msg)  {
            var projectData = msg.d;
            for(i=0; i<projectData.length; i++)
            {
              $("#cmbProject, #projectList").append("<option>" + projectData[i].ProjNAME + "</option>");
            }
        },
        error: function(e){           
	   $('#alertMessage').html("error: Failed to call WebService for cmbProject List"); $('#alertBox').modal();
        }
    });
} 

function fillCmbLotList(projNO, optionRequest)
{
        $.support.cors= true;
        $.ajax({
	    url: "http://ws.frendel.com/mobile/phonegap.asmx/spKP_getLotList",
            //url: "http://192.168.3.76:53435/phonegap.asmx/spKP_getLotList",
            contentType: 'application/json;charset=utf-8',
            type: "POST",
            data: JSON.stringify({projNum:projNO}),
            async:false,
            dataType: "json",
            success : function(msg)
            {
                var LotData = msg.d;
                for(i=0; i<LotData.length; i++)
                {
                    if(optionRequest === "option1")
                    {
                     $("#cmbLot").append("<option>" + LotData[i].LOT + "</option>");
                    }
                    else if(optionRequest === "option3")
                    {
                     $("#cmbViewedProjLot").append("<option>" + LotData[i].LOT + "</option>");
                    }
                }
            },
            error: function(e){              
	      $('#alertMessage').html("error: Failed to call WebService cmbLotList"); $('#alertBox').modal();
            }
        });
}

function cleanAllValues()
{
        /*Clean Schedule */
        $("#txtForecast").val("");
        $("#txtForecastUser").val("");
        $("#txtExpShip").val("");
        $("#txtExpShipUser").val("");
        $("#txtSiteRequestDate").val("");
        $("#txtCommentSchedule").val("");
        $("#txtTruckDeliveryDate").val("");
        $("#txtShipped").val("");
        $("#txtShipper").val("");
        $("#txtInstalled").val("");
        $("#txtInstaller").val("");

        /* Clean Office Status */
        $("#txtColour").val("");
        $("#txtColourUser").val("");
        $("#txtExtra").val("");
        $("#txtExtraUser").val("");
        //$("#chkExtra").attr("checked",false);
        $("#txtLayoutStart").val("");
        $("#txtLayoutStartUser").val("");
        $("#txtLayoutDone").val("");
        $("#txtLayoutDoneUser").val("");
        //$("#chkCTop").attr("checked",false);
        $("#txtPricingChecked").val("");
        $("#txtPricingCheckedUser").val("");
        $("#txtOrderCheck").val("");
        $("#txtOrderCheckUser").val("");
        $("#txtProductionReady").val("");
        $("#txtProductionReadyUser").val("");
        $("#txtDoorOrderDate").val("");

        /* Clean Production Status */
        $("#txtprReceived").val("");
        //$("#txtAccessoriesDate").val("");
        //$("#txtAccessoriesEmp").val("");
        $("#txtAssemblyStart").val("");
        $("#txtDoorsPicked").val("");
        $("#txtDoorsHinge").val("");
        $("#txtprodComplete").val("");

        $("#txtCabTotal").val("");
        $("#txtCabBuilt").val("");
        $("#txtCabWrapPaint").val("");
        $("#txtDoorTotal").val("");
        $("#txtDoorBuilt").val("");
        $("#txtDoorPainted").val("");
}
function styleColourModalPopUp(){
  $('#style_colour').modal();
}

function displayStyleColourInfo(CSID_No)
{
    $.support.cors= true;
    $.ajax({
	url: "http://ws.frendel.com/mobile/phonegap.asmx/spKP_StyleColourInfo",
        //url: "http://192.168.3.76:53435/phonegap.asmx/spKP_StyleColourInfo",
        contentType: 'application/json;charset=utf-8',
        type: "POST",
        data: JSON.stringify({CSID_Number:CSID_No}),
        async:false,
        dataType: "json",
        success : function(msg)  {
            var StyleColourData = msg.d;
            var tblHeadCreated = false;
            $('#tblStyleColour').empty();
                if(StyleColourData.length > 0)
                {
                    for(i=0; i<StyleColourData.length; i++)
                    {
                        if(tblHeadCreated === false){
                            var th;
                            th = '<tr>';
                            th += '<th>' + " Room " + '</th>';
                            th += '<th>' + " Style " + '</th>';
                            th += '<th>' + " Glazing " + '</th>';
                            th += '<th>' + " CounterTop " + '</th>';
                            th += '<th>' + " Hardware " + '</th>';
                            th += '</tr>';
                            tblHeadCreated = true;
                            $("#tblStyleColour").append(th);
			    $("#tblStyleColour").appendTo("#modalBodyStyleColor");
                        }
                        var tr ='<tr>';
                        tr += '<td>' + StyleColourData[i].RoomName + '</td>';
                        tr += '<td>' + StyleColourData[i].StyleColour + '</td>';
                        tr += '<td>' + StyleColourData[i].Glazing + '</td>';
                        tr += '<td>' + StyleColourData[i].CounterTop + '</td>';
                        tr += '<td>' + StyleColourData[i].Hardware + '</td>';
                        tr += '</tr>';
                        $("#tblStyleColour").append(tr);
			//$("#tblStyleColour").appendTo("#modalBodyStyleColor");
                    }		    
                }
                else
                {
                    var th;
                    th = '<tr>';
                    th += '<th>' + " Room " + '</th>';
                    th += '<th>' + " Style " + '</th>';
                    th += '<th>' + " Glazing " + '</th>';
                    th += '<th>' + " CounterTop " + '</th>';
                    th += '<th>' + " Hardware " + '</th>';
                    th += '</tr>';
                    $("#tblStyleColour").append(th);
                    var tr ='<tr>';
                    tr += '<td colspan="5" class= "no-records">' + "No Records are Found" + '</td>';
                    $("#tblStyleColour").append(tr);
		    //$("#tblStyleColour").appendTo("#modalBodyStyleColor");
                }	    
        },
        error: function(e){         
	 $('#alertMessage').html("error: Failed to call WebService for Style Colour Info"); $('#alertBox').modal();
        }
    });
}

function displayScheduleInfo(CSID_No)
{
    $.support.cors= true;
    $.ajax({
	url: "http://ws.frendel.com/mobile/phonegap.asmx/spKP_ScheduleInfo",
        //url: "http://192.168.3.76:53435/phonegap.asmx/spKP_ScheduleInfo",
        contentType: 'application/json;charset=utf-8',
        type: "POST",
        data: JSON.stringify({CSID_Number:CSID_No}),
        async:false,
        dataType: "json",
        success : function(msg)  {
            var ScheduleData = msg.d;
            for(i=0; i<ScheduleData.length; i++)
            {
	       $("#txtMeasuringDate").val(ScheduleData[i].MeasuringDate);
	       $("#txtMeasurerName").val(ScheduleData[i].Measurer);
               $("#txtForecast").val(ScheduleData[i].Forecast);
               $("#txtForecastUser").val(ScheduleData[i].Forecast_YN);
               $("#txtExpShip").val(ScheduleData[i].ExpectedShipped);
               $("#txtExpShipUser").val(ScheduleData[i].ExpectedShipped_YN);
               $("#txtSiteRequestDate").val(ScheduleData[i].SiteRequestDate);
               $("#txtCommentSchedule").val(ScheduleData[i].CommentSchedule);
               $("#txtTruckDeliveryDate").val(ScheduleData[i].AssignedDeliveryDate);
               $("#txtShipped").val(ScheduleData[i].Shipped_Done);
               $("#txtShipper").val(ScheduleData[i].Shipper);
               $("#txtInstalled").val(ScheduleData[i].Installed);
               $("#txtInstaller").val(ScheduleData[i].Installer);
	       $("#txtInspected").val(ScheduleData[i].InspectedDate);
	       
	       ForecastDate = ScheduleData[i].Forecast;
	       ModelName = ScheduleData[i].ModelName;
	       ModelType = ScheduleData[i].ModelType;
	       LayoutDoneUser = ScheduleData[i].LayoutDoneUser;	       
            }
        },
        error: function(e){           
	   $('#alertMessage').html("error: Failed to call WebService for Schedule Info"); $('#alertBox').modal();
        }
    });
}

function displayOfficeStatus(CSID_No)
{
    $.support.cors= true;
    $.ajax({
	url: "http://ws.frendel.com/mobile/phonegap.asmx/spKP_OfficeStatus",
        //url: "http://192.168.3.76:53435/phonegap.asmx/spKP_OfficeStatus",
        contentType: 'application/json;charset=utf-8',
        type: "POST",
        data: JSON.stringify({CSID_Number:CSID_No}),
        async:false,
        dataType: "json",
        success : function(msg)  {
            var OfficeData = msg.d;
            for(i=0; i<OfficeData.length; i++)
            {
               $("#txtColour").val(OfficeData[i].Colour);
               $("#txtColourUser").val(OfficeData[i].ColourUser);
               $("#txtExtra").val(OfficeData[i].Extras);
               $("#txtExtraUser").val(OfficeData[i].ExtrasUser);
               /*if(OfficeData[i].NoExtra)
               {
                $("#chkExtra").attr("checked", true);
               }*/
               $("#txtLayoutStart").val(OfficeData[i].LayoutStart);
               $("#txtLayoutStartUser").val(OfficeData[i].LayoutStartUser);
               $("#txtLayoutDone").val(OfficeData[i].LayoutDone);
               $("#txtLayoutDoneUser").val(OfficeData[i].LayoutDoneUser);
               /*if(OfficeData[i].NoCT)
               {
                $("#chkCTop").attr("checked", true);
               }*/
               $("#txtPricingChecked").val(OfficeData[i].PricingChecked);
               $("#txtPricingCheckedUser").val(OfficeData[i].PricingCheckedUser);
               $("#txtOrderCheck").val(OfficeData[i].OrderStart);
               $("#txtOrderCheckUser").val(OfficeData[i].OrderStartUser);
               $("#txtProductionReady").val(OfficeData[i].OrderFinish);
               $("#txtProductionReadyUser").val(OfficeData[i].OrderFinishUser);
               $("#txtDoorOrderDate").val(OfficeData[i].DoorOrderDate);
            }
        },
        error: function(e){         
	 $('#alertMessage').html("error: Failed to call WebService for Office Status"); $('#alertBox').modal();
        }
    });
}

function displayProductionStatus(CSID_No)
{
    $.support.cors= true;
    $.ajax({
	url: "http://ws.frendel.com/mobile/phonegap.asmx/spKP_ProductionInfo",
        //url: "http://192.168.3.76:53435/phonegap.asmx/spKP_ProductionInfo",
        contentType: 'application/json;charset=utf-8',
        type: "POST",
        data: JSON.stringify({CSID_Number:CSID_No}),
        async:false,
        dataType: "json",
        success : function(msg)  {
            var ProductionData = msg.d;
            var i=0;
            $("#txtprReceived").val(ProductionData[i].ProductionR);
            //$("#txtAccessoriesDate").val(ProductionData[i].AccessoriesDate);
            //$("#txtAccessoriesEmp").val(ProductionData[i].AccessoriesEmployee);
            $("#txtAssemblyStart").val(ProductionData[i].AssemblyStart);
            $("#txtDoorsPicked").val(ProductionData[i].DoorsPicked);
            $("#txtDoorsHinge").val(ProductionData[i].DoorsHinge);
            $("#txtprodComplete").val(ProductionData[i].ProductionComplete);
            $("#txtCabTotal").val(ProductionData[i].TotalCabinets);
            $("#txtCabBuilt").val(ProductionData[i].ScanDate);
            $("#txtCabWrapPaint").val(ProductionData[i].WrapDate);
            $("#txtDoorTotal").val(ProductionData[i].DoorCount);
            $("#txtDoorBuilt").val(ProductionData[i].RowDate);
            $("#txtDoorPainted").val(ProductionData[i].PaintDate);
            $('#cabinetStatus').text("Cabinet Labels -> "+ ProductionData[i].TotalCabinets
                                + " Assembled ->" + ProductionData[i].ScanDate +
                                " Wrapped ->" + ProductionData[i].WrapDate);

            $('#doorStatus').text("Total Doors -> "+ ProductionData[i].DoorCount
                    + " Total Raws ->" + ProductionData[i].RowDate +
                    " Total Painted ->" + ProductionData[i].PaintDate);
        },
        error: function(e){         
	 $('#alertMessage').html("error: Failed to call WebService for Production Status"); $('#alertBox').modal();
        }
    });
}

function displayCabinet(CSID_No)
{
    $.support.cors= true;
    $.ajax({
	url: "http://ws.frendel.com/mobile/phonegap.asmx/spKP_CabinetList",
        //url: "http://192.168.3.76:53435/phonegap.asmx/spKP_CabinetList",
        contentType: 'application/json;charset=utf-8',
        type: "POST",
        data: JSON.stringify({CSID_Number:CSID_No}), 
        async:false,
        dataType: "json",
        success : function(msg) {
                var CabinetData = msg.d;
                var tblHeadCreated = false;
                $('#tblProdCabinet').empty();
                if(CabinetData.length > 0)
                {
                    for(i=0; i<CabinetData.length; i++)
                    {
                        if(tblHeadCreated === false){
                         var th;
                         th = '<tr>';
                         th += '<th>' + " Cabinet Name " + '</th>';
                         th += '<th>' + " Scan Date " + '</th>';
                         th += '<th>' + " Scan Time " + '</th>';
                         th += '<th>' + " Assembler " + '</th>';
                         th += '<th>' + " Wrapping Date " + '</th>';
                         th += '<th>' + " Wrapping Time " + '</th>';
                         th += '<th>' + " Line# " + '</th>';
                         th += '<th>' + " Cart " + '</th>';
                         th += '</tr>';
                         tblHeadCreated = true;
                         $("#tblProdCabinet").append(th);
                        }  
                        var tr ='<tr>';
                        tr += '<td>' + CabinetData[i].CabinetName + '</td>';
                        tr += '<td>' + CabinetData[i].ScanDate + '</td>';
                        tr += '<td>' + CabinetData[i].ScanTime + '</td>';
                        tr += '<td>' + CabinetData[i].Assembler + '</td>';
                        tr += '<td>' + CabinetData[i].WrappingDate + '</td>';
                        tr += '<td>' + CabinetData[i].WrappingTime + '</td>';
                        tr += '<td>' + CabinetData[i].LineNo + '</td>';
                        tr += '<td>' + CabinetData[i].CartID + '</td>';
                        tr += '</tr>';
                        $("#tblProdCabinet").append(tr);
                    }
                }
                else
                {
                    var th;
                    th = '<tr>';
                    th += '<th>' + " Cabinet Name " + '</th>';
                    th += '<th>' + " Scan Date " + '</th>';
                    th += '<th>' + " Scan Time " + '</th>';
                    th += '<th>' + " Assembler " + '</th>';
                    th += '<th>' + " Wrapping Date " + '</th>';
                    th += '<th>' + " Wrapping Time " + '</th>';
                    th += '<th>' + " Line# " + '</th>';
                    th += '<th>' + " Cart " + '</th>';
                    th += '</tr>';
                    $("#tblProdCabinet").append(th);
                    var tr ='<tr>';
                    tr += '<td colspan="8" class= "no-records">' + "No Records are Found" + '</td>';
                    $("#tblProdCabinet").append(tr);
                }

        },
        error: function(e){         
	 $('#alertMessage').html("error: Failed to call WebService for Cabinet List"); $('#alertBox').modal();
        }
    });
}

function displayDoor(CSID_No)
{
    $.support.cors= true;
    $.ajax({
	    url: "http://ws.frendel.com/mobile/phonegap.asmx/spKP_DoorList",
            //url: "http://192.168.3.76:53435/phonegap.asmx/spKP_DoorList",
            contentType: 'application/json;charset=utf-8',
            type: "POST",
            data: JSON.stringify({CSID_Number:CSID_No}), 
            async:false,
            dataType: "json",
            success : function(msg)  {
                var DoorData = msg.d;
                var tblHeadCreated = false;
                $('#tblProdDoor').empty();
                if(DoorData.length > 0)
                {
                    for(i=0; i<DoorData.length; i++)
                    {
                        if(tblHeadCreated === false){
                         var th;
                         th = '<tr>';
                         th += '<th>' + " Style " + '</th>';
                         th += '<th>' + " Colour " + '</th>';
                         th += '<th>' + " Glazing " + '</th>';
                         th += '<th>' + " Raw Date " + '</th>';
                         th += '<th>' + " Paint Date " + '</th>';
                         th += '<th>' + " Door Count " + '</th>';
                         th += '</tr>';
                         tblHeadCreated = true;
                         $("#tblProdDoor").append(th);
                        }
                        var tr ='<tr>';
                        tr += '<td>' + DoorData[i].Style + '</td>';
                        tr += '<td>' + DoorData[i].Colour + '</td>';
                        tr += '<td>' + DoorData[i].Glazing + '</td>';
                        tr += '<td>' + DoorData[i].RawDate + '</td>';
                        tr += '<td>' + DoorData[i].PaintDate + '</td>';
                        tr += '<td>' + DoorData[i].DoorCount + '</td>';
                        tr += '</tr>';
                        $("#tblProdDoor").append(tr);
                    }
                }
                else
                {
                    var th;
                    th = '<tr>';
                    th += '<th>' + " Style " + '</th>';
                    th += '<th>' + " Colour " + '</th>';
                    th += '<th>' + " Glazing " + '</th>';
                    th += '<th>' + " Raw Date " + '</th>';
                    th += '<th>' + " Paint Date " + '</th>';
                    th += '<th>' + " Door Count " + '</th>';
                    th += '</tr>';
                    $("#tblProdDoor").append(th);
                    var tr ='<tr>';
                    tr += '<td colspan="6" class= "no-records">' + "No Records are Found" + '</td>';
                    $("#tblProdDoor").append(tr);
                }

            },
            error: function(e){               
	       $('#alertMessage').html("error: Failed to call WebService for Door List"); $('#alertBox').modal();
            }
    });
}
function displayDoorDoma(Master_FKNo,DomaNo)
{
    $.support.cors= true;
    $.ajax({
	url: "http://ws.frendel.com/mobile/phonegap.asmx/spKP_DoorDomaList",
        //url: "http://192.168.3.76:53435/phonegap.asmx/spKP_DoorDomaList",
        contentType: 'application/json;charset=utf-8',
        type: "POST",
        data: JSON.stringify({Master_FKNumber:Master_FKNo,Doma_Number:DomaNo}),
        async:false,
        dataType: "json", 
        success : function(msg)  {
            var DoorDomaData = msg.d;
            var tblHeadCreated = false;
            $('#tblProdDoorDoma').empty();
                if(DoorDomaData.length > 0)
                {
                    for(i=0; i<DoorDomaData.length; i++)
                    {
                        if(tblHeadCreated === false){
                            var th;
                            th = '<tr>';
                            th += '<th>' + " Status " + '</th>';
                            th += '<th>' + " Order ID " + '</th>';
                            th += '<th>' + " Style " + '</th>';
                            th += '<th>' + " Color " + '</th>';
                            th += '<th>' + " OrderDate " + '</th>';
                            th += '<th>' + " ProductionReceived " + '</th>';
                            th += '<th>' + " CompletedDate " + '</th>';
                            th += '<th>' + " FrendelOrderDate " + '</th>';
                            th += '</tr>';
                            tblHeadCreated = true;
                            $("#tblProdDoorDoma").append(th);
                        }

                        var tr ='<tr>';
                        tr += '<td>' + DoorDomaData[i].Status + '</td>';
                        tr += '<td>' + DoorDomaData[i].OrderID + '</td>';
                        tr += '<td>' + DoorDomaData[i].Style + '</td>';
                        tr += '<td>' + DoorDomaData[i].Colour + '</td>';
                        tr += '<td>' + DoorDomaData[i].OrderDate + '</td>';
                        tr += '<td>' + DoorDomaData[i].ProdReceived + '</td>';
                        tr += '<td>' + DoorDomaData[i].CompletedDate + '</td>';
                        tr += '<td>' + DoorDomaData[i].FrendelOrderDate + '</td>';
                        tr += '</tr>';
                        $("#tblProdDoorDoma").append(tr);
                    }
                }
                else
                {
                    var th;
                    th = '<tr>';
                    th += '<th>' + " Status " + '</th>';
                    th += '<th>' + " Order ID " + '</th>';
                    th += '<th>' + " Style " + '</th>';
                    th += '<th>' + " Color " + '</th>';
                    th += '<th>' + " OrderDate " + '</th>';
                    th += '<th>' + " ProductionReceived " + '</th>';
                    th += '<th>' + " CompletedDate " + '</th>';
                    th += '<th>' + " FrendelOrderDate " + '</th>';
                    th += '</tr>';
                    $("#tblProdDoorDoma").append(th);
                    var tr ='<tr>';
                    tr += '<td colspan="8" class= "no-records">' + "No Records are Found" + '</td>';
                    $("#tblProdDoorDoma").append(tr);
                }

        },
        error: function(e){          
	  $('#alertMessage').html("error: Failed to call WebService for DoorDoma List"); $('#alertBox').modal();
        }
    });
}

function displayServiceQA(CSID_No) {
    $.support.cors= true;
    $.ajax({
	url: "http://ws.frendel.com/mobile/phonegap.asmx/spKP_ServiceQAList",
        //url: "http://192.168.3.76:53435/phonegap.asmx/spKP_ServiceQAList",
        contentType: 'application/json;charset=utf-8',
        type: "POST",
        data: JSON.stringify({CSID_Number:CSID_No, optionType:"LotCustInfo"}),
        async:false,
        dataType: "json",
        success : function(msg)  {
            var ServiceData = msg.d;
            var tblHeadCreated = false;
            $('#tblServiceLotInfo').empty();
            for(i=0; i<ServiceData.length; i++)
            {
                //** Filling Lot Information **
                if(tblHeadCreated === false){
                    var th;
                    th = '<tr>';
                    th += '<th>' + " FK# " + '</th>';
                    th += '<th>' + " LOT " + '</th>';
                    th += '<th>' + " Model " + '</th>';
                    th += '<th>' + " ModelType " + '</th>';
                    th += '</tr>';
                    tblHeadCreated = true;
                    $("#tblServiceLotInfo").append(th);
                }
                var tr ='<tr>';
                tr += '<td style="white-space:nowrap">' + ServiceData[i].FKNO + '</td>';
                tr += '<td>' + ServiceData[i].LOT + '</td>';
                tr += '<td>' + ServiceData[i].Model + '</td>';
                tr += '<td>' + ServiceData[i].ModelType + '</td>';
                tr += '</tr>';
                $("#tblServiceLotInfo").append(tr);
               //** Filling Customer Information **
                $("#lbltxtCustFullName").text(ServiceData[i].FName + " " + ServiceData[i].LName);                
                $("#lbltxtCustStreet").text(ServiceData[i].StreetNum + " " + ServiceData[i].StreetName);
                $("#lbltxtCustCity").text(ServiceData[i].City);                
                $("#lbltxtCustPostalCode").text(ServiceData[i].ZipPostal);                
                $("#lbltxtCustHome1").text(ServiceData[i].HomePhone1);
                $("#lbltxtCustHome2").text(ServiceData[i].HomePhone2);
                $("#lbltxtCustCellPh1").text(ServiceData[i].WorkPhone1);
                $("#lbltxtCustCellPh2").text(ServiceData[i].WorkPhone2);                              
                $("#lbltxtCustEmail").text(ServiceData[i].Email);
            }
        },
        error: function(e){          
	  $('#alertMessage').html("error: Failed to call WebService for Lot Customer Info"); $('#alertBox').modal();
        }
    });
    
    $.ajax({
	url: "http://ws.frendel.com/mobile/phonegap.asmx/spKP_ServiceQAList",
        //url: "http://192.168.3.76:53435/phonegap.asmx/spKP_ServiceQAList",
        contentType: 'application/json;charset=utf-8',
        type: "POST",
        data: JSON.stringify({CSID_Number:CSID_No, optionType:"OpenDeficiency"}),
        async:false,
        dataType: "json",
        success : function(msg){
            var ServiceData = msg.d;
            var tblHeadCreated = false;
            $('#tblServiceOpenDeficiency').empty();
	    $('#countOpenDef').text(ServiceData.length);
            if(ServiceData.length > 0)
            {
                for(i=0; i<ServiceData.length; i++)
                {
                   //** Filling Open Deficiency Information **
                    if(tblHeadCreated === false)
                    {
                        var th;
                        th = '<tr>';
                        th += '<th>' + " Frendel# " + '</th>';
                        th += '<th>' + " INDATE " + '</th>';
                        th += '<th>' + " CATEGORY " + '</th>';
                        th += '<th>' + " Desc " + '</th>';
                        th += '<th>' + " NextVisit " + '</th>';
                        th += '<th>' + " Age(D) " + '</th>';
                        th += '</tr>';
                        tblHeadCreated = true;
                        $("#tblServiceOpenDeficiency").append(th);
                    }
                        var tr ='<tr>';
                        tr += '<td style="white-space:nowrap">' + ServiceData[i].DefKey_Open + '</td>';
                        tr += '<td>' + ServiceData[i].InDate_Open + '</td>';
                        tr += '<td>' + ServiceData[i].Category_Open + '</td>';
                        tr += '<td>' + ServiceData[i].Description_Open + '</td>';
                        tr += '<td>' + ServiceData[i].NextVisit_Open + '</td>';
                        tr += '<td>' + ServiceData[i].Age_Open + '</td>';
                        tr += '</tr>';
                        $("#tblServiceOpenDeficiency").append(tr);
                }
            }
            else
            {
                var th;
                th = '<tr>';
                th += '<th>' + " Frendel# " + '</th>';
                th += '<th>' + " INDATE " + '</th>';
                th += '<th>' + " CATEGORY " + '</th>';
                th += '<th>' + " Desc " + '</th>';
                th += '<th>' + " NextVisit " + '</th>';
                th += '<th>' + " Age(D) " + '</th>';
                th += '</tr>';
                $("#tblServiceOpenDeficiency").append(th);
                var tr ='<tr>';
                tr += '<td colspan="6" class= "no-records">' + "No Records are Found" + '</td>';
                $("#tblServiceOpenDeficiency").append(tr);
            }
        },
        error: function(e){        
	$('#alertMessage').html("error: Failed to call WebService for Service Open Deficiency"); $('#alertBox').modal();
        }
    });
    
    $.ajax({
	url: "http://ws.frendel.com/mobile/phonegap.asmx/spKP_ServiceQAList",
        //url: "http://192.168.3.76:53435/phonegap.asmx/spKP_ServiceQAList",
        contentType: 'application/json;charset=utf-8',
        type: "POST",
        data: JSON.stringify({CSID_Number:CSID_No, optionType:"ClosedDeficiency"}),
        async:false,
        dataType: "json",
        success : function(msg){
            var ServiceData = msg.d;
            var tblHeadCreated = false;
            $('#tblServiceClosedDeficiency').empty();
	    $('#countClosedDef').text(ServiceData.length);
                if(ServiceData.length > 0)
                {
                    for(i=0; i<ServiceData.length; i++)
                    {
                        //** Filling Closed Deficiency Information **
                        if(tblHeadCreated === false)
                        {
                            var th;
                            th = '<tr>';
                            th += '<th>' + " Frendel# " + '</th>';
                            th += '<th>' + " INDATE " + '</th>';
                            th += '<th>' + " CATEGORY " + '</th>';
                            th += '<th>' + " Desc " + '</th>';
                            th += '<th>' + " DATEDONE " + '</th>';
                            th += '</tr>';
                            tblHeadCreated = true;
                            $("#tblServiceClosedDeficiency").append(th);
                        }
                        var tr ='<tr>';
                        tr += '<td style="white-space:nowrap">' + ServiceData[i].DefKey_Closed + '</td>';
                        tr += '<td>' + ServiceData[i].InDate_Closed + '</td>';
                        tr += '<td>' + ServiceData[i].Category_Closed + '</td>';
                        tr += '<td>' + ServiceData[i].Description_Closed + '</td>';
                        tr += '<td>' + ServiceData[i].DateDone_Closed + '</td>';
                        tr += '</tr>';
                        $("#tblServiceClosedDeficiency").append(tr);
                    }
                }
                else
                {
                    var th;
                    th = '<tr>';
                    th += '<th>' + " Frendel# " + '</th>';
                    th += '<th>' + " INDATE " + '</th>';
                    th += '<th>' + " CATEGORY " + '</th>';
                    th += '<th>' + " Desc " + '</th>';
                    th += '<th>' + " DATEDONE " + '</th>';
                    th += '</tr>';
                    $("#tblServiceClosedDeficiency").append(th);
                    var tr ='<tr>';
                    tr += '<td colspan="6" class= "no-records">' + "No Records are Found" + '</td>';
                    $("#tblServiceClosedDeficiency").append(tr);
                }
        },
        error: function(e){        
	$('#alertMessage').html("error: Failed to call WebService for Service Closed Deficiency"); $('#alertBox').modal();
        }
    });
    
    $.ajax({
	url: "http://ws.frendel.com/mobile/phonegap.asmx/spKP_ServiceQAList",
        //url: "http://192.168.3.76:53435/phonegap.asmx/spKP_ServiceQAList",
        contentType: 'application/json;charset=utf-8',
        type: "POST",
        data: JSON.stringify({CSID_Number:CSID_No, optionType:"ServiceScheduleLogs"}),
        async:false,
        dataType: "json",
        success : function(msg){
            var ServiceData = msg.d;
            var tblHeadCreated = false;
            $('#tblServiceScheduleLogs').empty();
                if(ServiceData.length > 0)
                {
                    for(i=0; i<ServiceData.length; i++)
                    {
                        //** Filling Schedule Logs Information **
                        if(tblHeadCreated === false){
                            var th;
                            th = '<tr>';
                            th += '<th>' + " Date " + '</th>';
                            th += '<th>' + " Time " + '</th>';
                            th += '<th>' + " ServiceMan " + '</th>';
                            th += '<th>' + " ScheduleComment " + '</th>';
                            th += '<th>' + " TimeIn " + '</th>';
                            th += '<th>' + " TimeOut " + '</th>';
                            th += '</tr>';
                            tblHeadCreated = true;
                            $("#tblServiceScheduleLogs").append(th);
                        }
                        var tr ='<tr>';
                        tr += '<td style="white-space:nowrap">' + ServiceData[i].Schedule_Date + '</td>';
                        tr += '<td>' + ServiceData[i].Schedule_Time + '</td>';
                        tr += '<td>' + ServiceData[i].Schedule_ServiceMan + '</td>';
                        tr += '<td>' + ServiceData[i].Schedule_Comment + '</td>';
                        tr += '<td>' + ServiceData[i].TimeIn + '</td>';
                        tr += '<td>' + ServiceData[i].TimeOut + '</td>';
                        tr += '</tr>';
                        $("#tblServiceScheduleLogs").append(tr);
                    }
                }
                else
                {
                    var th;
                    th = '<tr>';
                    th += '<th>' + " Date " + '</th>';
                    th += '<th>' + " Time " + '</th>';
                    th += '<th>' + " ServiceMan" + '</th>';
                    th += '<th>' + " ScheduleComment " + '</th>';
                    th += '<th>' + " TimeIn " + '</th>';
                    th += '<th>' + " TimeOut " + '</th>';
                    th += '</tr>';
                    $("#tblServiceScheduleLogs").append(th);
                    var tr ='<tr>';
                    tr += '<td colspan="6" class= "no-records">' + "No Records are Found" + '</td>';
                    $("#tblServiceScheduleLogs").append(tr);
                }
        },
        error: function(e){        
	$('#alertMessage').html("error: Failed to call WebService for Service Schedule Log"); $('#alertBox').modal();
        }
    });

    $.ajax({
	url: "http://ws.frendel.com/mobile/phonegap.asmx/spKP_ServiceQAList",
        //url: "http://192.168.3.76:53435/phonegap.asmx/spKP_ServiceQAList",
        contentType: 'application/json;charset=utf-8',
        type: "POST",
        data: JSON.stringify({CSID_Number:CSID_No, optionType:"CustomerCallLogs"}),
        async:false,
        dataType: "json",
        success : function(msg){
            var ServiceData = msg.d;
            var tblHeadCreated = false;
            $('#tblServiceCallLogs').empty();
                if(ServiceData.length > 0)
                {
                    for(i=0; i<ServiceData.length; i++)
                    {
                        //** Filling Customer Call Logs Information **
                        if(tblHeadCreated === false){
                            var th;
                            th = '<tr>';
                            th += '<th>' + " Call Time " + '</th>';
                            th += '<th>' + " User ID " + '</th>';
                            th += '<th>' + " Action " + '</th>';
                            th += '<th>' + " Comment " + '</th>';
                            th += '</tr>';
                            tblHeadCreated = true;
                            $("#tblServiceCallLogs").append(th);
                        }
                        var tr ='<tr>';
                        tr += '<td style="white-space:nowrap">' + ServiceData[i].Call_Time + '</td>';
                        tr += '<td>' + ServiceData[i].User_ID + '</td>';
                        tr += '<td>' + ServiceData[i].Action + '</td>';
                        tr += '<td>' + ServiceData[i].Comment + '</td>';
			tr += '</tr>';
			$("#tblServiceCallLogs").append(tr);
		    }
		}
		else
		{
			var th;
			th = '<tr>';
			th += '<th>' + " Call Time " + '</th>';
			th += '<th>' + " User ID " + '</th>';
			th += '<th>' + " Action " + '</th>';
			th += '<th>' + " Comment " + '</th>';
			th += '</tr>';
			$("#tblServiceCallLogs").append(th);
			var tr ='<tr>';
			tr += '<td colspan="4" class= "no-records">' + "No Records are Found" + '</td>';
			$("#tblServiceCallLogs").append(tr);
		}
	},
	error: function(e){	
	$('#alertMessage').html("error: Failed to call WebService for CustomerCallLogs"); $('#alertBox').modal();
	}
    });
}

function displayAttachedLotImage(lot_FileID){
    $.support.cors= true;
    $.ajax({
	url: "http://ws.frendel.com/mobile/phonegap.asmx/spKP_getImageLOTFromLOTDB",
        //url: "http://192.168.3.76:53435/phonegap.asmx/spKP_getImageLOTFromLOTDB",
        contentType: 'application/json;charset=utf-8',
        type: "POST",
        data: JSON.stringify({LotFileID:lot_FileID}),
        async:false,
        dataType: "json",
        success : function(msg)  {
            var attachedLotImage = msg.d;
            window.location.href = "#orderAttachedLotImage";
            $("#imgAttachedLot").attr('src','data:image/jpg;base64,' + attachedLotImage);
        },
        error: function(xhr, errorThrown, textStatus){            
	    $('#alertMessage').html("error: Failed to call WebService for attached lot image" +  " " + textStatus); $('#alertBox').modal();
        }
    });
}

function displayAttachment(CSID_No){
    $.ajax({
    url: "http://ws.frendel.com/mobile/phonegap.asmx/spKP_getLotFromLOTDB",
    //url: "http://192.168.3.76:53435/phonegap.asmx/spKP_getLotFromLOTDB",
    contentType: 'application/json;charset=utf-8',
    type: "POST",
    data: JSON.stringify({CSID_Number:CSID_No}),
    async:false,
    dataType: "json",
        success : function(msg){
           attachedData = msg.d;
            var tblHeadCreated = false;
            $('#tblOrderAttachment').empty();
		var th;
		th = '<tr>';
		th += '<th>' + " " + '</th>';
		th += '<th>' + " File Name " + '</th>';
		th += '<th>' + " File Extention " + '</th>';
		th += '<th>' + " Upload Date " + '</th>';
		th += '<th>' + " User " + '</th>';
		th += '<th>' + " Comment " + '</th>';
		th += '</tr>';
                if(attachedData.length > 0)
                {
                    for(i=0; i<attachedData.length; i++)
                    {
                        //** Filling Customer Call Logs Information **
                        if(tblHeadCreated === false){
                            
                            tblHeadCreated = true;
                            $("#tblOrderAttachment").append(th);
                        }
                        var tr ='<tr>';
                        tr += '<td>' + '<img src="img/ViewImage.jpg" id="'+ attachedData[i].LotFileID +'" alt="_attachedLotImg" onclick="displayAttachedLotImage(id)"/> ' + '</td>';
                        tr += '<td>' + attachedData[i].FileName + '</td>';
                        tr += '<td>' + attachedData[i].FileExt + '</td>';
                        tr += '<td style="white-space:nowrap">' + attachedData[i].Uptime + '</td>';
                        tr += '<td>' + attachedData[i].UserName + '</td>';
                        tr += '<td>' + attachedData[i].Comment + '</td>';
                        tr += '</tr>';
                        $("#tblOrderAttachment").append(tr);
                    }
		}
		else
		{		    
		    $("#tblOrderAttachment").append(th);
		    var tr ='<tr>';
		    tr += '<td colspan="6" class= "no-records">' + "No Records are Found" + '</td>';
		    $("#tblOrderAttachment").append(tr);
		}
        },
        error: function(e){        
	$('#alertMessage').html("error: Failed to call WebService for display attachment"); $('#alertBox').modal();
        }
    });
    //return convertedMasterNo;
}

function callingFunctionOrderInfo(CSID_No, Master_FKNo, projNO)
{
    cleanAllValues();
    displayStyleColourInfo(CSID_No);
    displayScheduleInfo(CSID_No);
    displayOfficeStatus(CSID_No);
    displayProductionStatus(CSID_No);
    displayCabinet(CSID_No);
    displayDoor(CSID_No);
    displayDoorDoma(Master_FKNo,"%");
    displayServiceQA(CSID_No);    
    displayAttachment(CSID_No);
    googleMap(0); //Showing Map for Customer Infomration
}

function getConvertedFKNo(ConvertedNumber,withX_t_f)
{
    var convertedMasterNo="";
    $.ajax({
    url: "http://ws.frendel.com/mobile/phonegap.asmx/spGetConvertedFKNumber",
    //url: "http://192.168.3.76:53435/phonegap.asmx/spGetConvertedFKNumber",
    contentType: 'application/json;charset=utf-8',
    type: "POST",
    data: JSON.stringify({Converted_No:ConvertedNumber, withX:withX_t_f}),
    async:false,
    dataType: "json",
        success : function(msg){
           convertedMasterNo = msg.d;
        },
        error: function(e){        
	$('#alertMessage').html("error: Failed to call WebService for Converted FK Number"); $('#alertBox').modal();
        }
    });
    return convertedMasterNo;
}

function getOrderStatusByCSID(CSID_No)
{
    var orderList;
    $.support.cors= true;
    $.ajax({
	url: "http://ws.frendel.com/mobile/phonegap.asmx/spKP_OrderList",
        //url: "http://192.168.3.76:53435/phonegap.asmx/spKP_OrderList",
        contentType: 'application/json;charset=utf-8',
        type: "POST",
        data: JSON.stringify({CSID_Number:CSID_No}),
        async:false,
        dataType: "json", 
        success : function(msg){
           orderList = msg.d;
        },
        error: function(e){         
	 $('#alertMessage').html("error: Failed to call WebService for Order Status by CSID"); $('#alertBox').modal();
        }
    });
    return orderList;
}

function getCSIDNumberByFK(Master_FKNo) {
    
    $.support.cors= true;
    $.ajax({
	url: "http://ws.frendel.com/mobile/phonegap.asmx/spKPGetCSIDByFK",
        //url: "http://192.168.3.76:53435/phonegap.asmx/spKPGetCSIDByFK",
        contentType: 'application/json;charset=utf-8',
        type: "POST",
        data: JSON.stringify({MasterNumber:Master_FKNo}),
        async:false,
        dataType: "json",
        success : function(msg){
           CSID_No = msg.d;
        },
        error: function(e){          
	  $('#alertMessage').html("error: Failed to call WebService for CSID number by FK"); $('#alertBox').modal();
        }
    });
    return CSID_No;
}

function getProjNumber(builderName,projectName)
{
        $.support.cors= true;
        $.ajax({
	url: "http://ws.frendel.com/mobile/phonegap.asmx/getProjectNum",
        //url: "http://192.168.3.76:53435/phonegap.asmx/getProjectNum",
        contentType: 'application/json;charset=utf-8',
        type: "POST",
        data: JSON.stringify({builder_Name:builderName,project_Name:projectName}),
        async:false,
        dataType: "json",
        success : function(msg){
           projNO = msg.d;
        },
        error: function(e){           
	   $('#alertMessage').html("error: Failed to call WebService for Project Number"); $('#alertBox').modal();
        }
    });
    return projNO;
}

function getLast10ViewedProjectNumber(projectName)
{
    $.support.cors= true;
    $.ajax({
	url: "http://ws.frendel.com/mobile/phonegap.asmx/getLast10ViewedProjectNumber",
        //url: "http://192.168.3.76:53435/phonegap.asmx/getLast10ViewedProjectNumber",
        contentType: 'application/json;charset=utf-8',
        type: "POST",
        data: JSON.stringify({project_Name:projectName}),
        async:false,
        dataType: "json",
        success : function(msg){
            projNO = msg.d;
        },
        error: function(e){          
	  $('#alertMessage').html("error: Failed to call WebService for last 10 Viewed Project No"); $('#alertBox').modal();
        }
    });
    return projNO;
}

function getLast10ViewedProjectBuilderName(projectName)
{
    $.support.cors= true;
    $.ajax({
	url: "http://ws.frendel.com/mobile/phonegap.asmx/getLast10ViewedProjectBuilderName",
        //url: "http://192.168.3.76:53435/phonegap.asmx/getLast10ViewedProjectBuilderName",
        contentType: 'application/json;charset=utf-8',
        type: "POST",
        data: JSON.stringify({project_Name:projectName}),
        async:false,
        dataType: "json",
        success : function(msg){
           builderName = msg.d;
        },
        error: function(e){           
	   $('#alertMessage').html("error: Failed to call WebService for last 10 Viewed BuilderName"); $('#alertBox').modal();
        }
    });
    return builderName;
}

function getFKNumber(lotNo,projNO)
{
    $.support.cors= true;
    $.ajax({
	url: "http://ws.frendel.com/mobile/phonegap.asmx/getMaster_FKNumber",
        //url: "http://192.168.3.76:53435/phonegap.asmx/getMaster_FKNumber",
        contentType: 'application/json;charset=utf-8',
        type: "POST",
        data: JSON.stringify({strLOT:lotNo, projNum:projNO}),
        async:false,
        dataType: "json",
        success : function(msg){
           Master_FKNo = msg.d;
        },
        error: function(e){          
	  $('#alertMessage').html("error: Failed to call WebService for FK Number"); $('#alertBox').modal();
        }
    });
        return Master_FKNo;
}

function getCSIDNumber(lotNo,projNO)
{
    $.support.cors= true;
    $.ajax({
	url: "http://ws.frendel.com/mobile/phonegap.asmx/getCSID",
        //url: "http://192.168.3.76:53435/phonegap.asmx/getCSID",
        contentType: 'application/json;charset=utf-8',
        type: "POST",
        data: JSON.stringify({strLOT:lotNo, projNum:projNO}),
        async:false,
        dataType: "json",
        success : function(msg){
           CSID_No = msg.d;
        },
        error: function(e){          
	  $('#alertMessage').html("error: Failed to call WebService for CSID No"); $('#alertBox').modal();
        }
    });
       return CSID_No;
}

/***************** Call by Option1 Selection *************************/
function displayOrderInfo()
{
        if($('#cmbBuilder')[0].selectedIndex > 0 && $('#cmbProject')[0].selectedIndex > 0 && $('#cmbLot')[0].selectedIndex > 0){
           builderName = $('#cmbBuilder option:selected').text();
           projectName = $('#cmbProject option:selected').text();
           if($('#cmbLot')[0].selectedIndex > 0){
                lotNo = $('#cmbLot option:selected').text();
                projNO = getProjNumber(builderName, projectName);
                Master_FKNo = getFKNumber(lotNo,projNO);
                CSID_No = getCSIDNumber(lotNo,projNO);
                if(Master_FKNo.length === 0)
                {
                 Master_FKNo = "FK#(--Not Found--)";
                }
                $('.orderInfoDisplay').text(Master_FKNo + " / " + builderName + " / " + projectName + " / " + lotNo );
                callingFunctionOrderInfo(CSID_No, Master_FKNo, projNO);
                $('#doorsDomaStatus').text("Doors Ordered from DOMA/VENLAM");
                last10ViewedProjects(txtuserName, projNO, projectName,builderName,false); //When user physically view Order Information, then update the Option 3 Drop Down Box
            }
            else
            {
             $('#orderInfoDisplay').text(builderName + " / " + projectName);
            }
            window.location.href="#home";
            return true;
        }
        else{            
	    $('#alertMessage').html("Please select builder or project or Lot..."); $('#alertBox').modal();
            return false;
        }
}
/***************** Call by Option2 Selection *************************/
function searchFKNO()
{
        Master_FKNo = "";
        CSID_No = 0;
        var BarCode = $("#txtSearchFKNo").val().toUpperCase();
        if(BarCode.length > 0 && Master_FKNo === "")
        {
            try
            {
                if( BarCode.substring(0,2) === "FK" && BarCode.length >= 11)
                {
                    if (BarCode.length === 11 || BarCode.length === 12)
                    {
                      Master_FKNo = BarCode;
                    }
                    else
                    {
                        if (BarCode.substring(12,1)=== "-")
                        {
                         Master_FKNo = BarCode.substring(0,12);
                        }
                        else if (BarCode.substring(12,1)=== "X")
                        {
                            if (BarCode.length === 13 || BarCode.length === 16)
                            {
                              Master_FKNo = BarCode;
                            }
                        }
                        else
                        {
                          Master_FKNo = BarCode.substring(0,11);
                        }
                    }
                }
                else if(Master_FKNo === "")
                {
                    var ConvertedNumber = 0;
                    if (BarCode[BarCode.length-1] === "X") //Barcode entry with the end of "X"
                    {
                        ConvertedNumber = parseInt(BarCode.replace("X", ""));
                        if (ConvertedNumber === 0)
                        {
                            if (BarCode === "00000X") {
                              Master_FKNo = "FK-00-00000";
                            }
                        }
                        else if (ConvertedNumber > 0)
                        {
                          Master_FKNo = getConvertedFKNo(ConvertedNumber,true);
                        }
                        else
                        {
                          Master_FKNo = "";
                        }
                    }
                    else 
                    {
                        ConvertedNumber = parseInt(BarCode);
                        if (ConvertedNumber === 0)
                        {
                            if (BarCode === "00000")
                            {
                              Master_FKNo = "FK-00-00000";
                            }
                        }
                        else if (ConvertedNumber > 0)
                        {
                          Master_FKNo = getConvertedFKNo(ConvertedNumber,false);
                        }
                    }
                }

                if (Master_FKNo != "" && CSID_No === 0) //Barcode with FK# or without FK#
                {
                    CSID_No = getCSIDNumberByFK(Master_FKNo);
                    if (CSID_No === 0) {                      
		      $('#alertMessage').html("Invalid Entry, there is no record in our database!!"); $('#alertBox').modal();
                    }
                    else
                    {
                        var getOrderList = getOrderStatusByCSID(CSID_No);			
                        $('.orderInfoDisplay').text(Master_FKNo + " / " + getOrderList[0].builderName + " / " + getOrderList[0].projName + " / " + getOrderList[0].LotName );
                        projNO = getOrderList[0].projNum;
                        projectName = getOrderList[0].projName;
                        builderName = getOrderList[0].builderName;
                        callingFunctionOrderInfo(CSID_No, Master_FKNo, projNO);
			lotNo = getOrderList[0].LotName;
                        last10ViewedProjects(txtuserName, projNO, projectName, builderName, false);
                        $('#doorsDomaStatus').text("Doors Ordered from DOMA/VENLAM");
                        window.location.href="#home";
                    }
                }
                else if (Master_FKNo === "" && CSID_No === 0) {                   
		   $('#alertMessage').html("Invalid Entry, Please enter proper FK#"); $('#alertBox').modal();
                }

           }
           catch(e)
            {              
	      $('#alertMessage').html("Error Loading Order!" + e); $('#alertBox').modal();
            }
        }
        else
        {           
	   $('#alertMessage').html("Invalid Entry, Please enter proper FK#"); $('#alertBox').modal();
        }
}
/***************** Call by Option3 Selection *************************/
function viewOrderInfo()
{    
    if ($("#cmbViewedProject")[0].selectedIndex > 0 && $("#cmbViewedProjLot")[0].selectedIndex > 0) {
        lotNo = $('#cmbViewedProjLot option:selected').text();
        projNO = getLast10ViewedProjectNumber(viewedlastProjectName[1]);
        projectName = viewedlastProjectName[1];
        Master_FKNo = getFKNumber(lotNo,projNO);
        CSID_No = getCSIDNumber(lotNo,projNO);
        builderName = getLast10ViewedProjectBuilderName(projectName);
        if(Master_FKNo.length === 0)
        {
           Master_FKNo = "FK#(--Not Found--)";
        }
        $('.orderInfoDisplay').text(Master_FKNo + " / " + builderName + " / " + projectName + " / " + lotNo );
        callingFunctionOrderInfo(CSID_No, Master_FKNo, projNO);
        $('#doorsDomaStatus').text("Doors Ordered from DOMA/VENLAM");
        window.location.href="#home";
    }
    else{      
      $('#alertMessage').html("Please Select Last 10 Viewed Project or Lot List"); $('#alertBox').modal();
    }
}

function last10ViewedProjects(txtuserName,projNO,projectName,builderName,loginbtnClick)
{    
    $.support.cors= true;
    $.ajax({
	url: "http://ws.frendel.com/mobile/phonegap.asmx/spKP_InsertLast10ViewedProjects",
        //url: "http://192.168.3.76:53435/phonegap.asmx/spKP_InsertLast10ViewedProjects",
        contentType: 'application/json;charset=utf-8',
        type: "POST",
        data: JSON.stringify({userName:txtuserName, projectNum:projNO, projectName:projectName,builderName:builderName,loginClick:loginbtnClick}),
        async:false,
        dataType: "json",
        success : function(msg) {
          $("#cmbViewedProject option").remove();
          $("#cmbViewedProject").append('<option>--Last 10 Viewed Builder/Project--</option>');
          $("#cmbViewedProjLot option").remove();
          $("#cmbViewedProjLot").append('<option>---Viewed Project Lot List---</option>');
          var lastViewedProject = msg.d;
          for(i=0; i<lastViewedProject.length;i++)
          {
            $("#cmbViewedProject").append("<option>" + lastViewedProject[i].BuilderName + "/" + lastViewedProject[i].ProjectName + "</option>");
          }
        },
        error: function(msg){          
	  $('#alertMessage').html("error: Failed to call WebService last10ViewedProject :" + msg); $('#alertBox').modal();
	  
        }
    });
}

//server time
function ServerTime()
{

}
function ServerTime_callBack(st)
{
    var ct = new Date();    
    $('#alertMessage').html("Server: " + st.toLocaleString() + "\r\n[Client: " + ct.toLocaleString() + "]"); $('#alertBox').modal();
} 

//server time


// MAPS
/*$( document ).on( 'pageshow', '#map-canvas',function(event){
  googleMap();
});*/

function mapLocationStatus() {
  if (mapLocationFailed === 1) {$('#alertMessage').html("Location couldn't find"); $('#alertBox').modal(); }
}
function googleMap(addressType){  
  mapLocationFailed = 0;
  var address="";
  if (addressType === 0) {
    address = $("#lbltxtCustStreet").text() + "," + $("#lbltxtCustCity").text() + "," + $("#lbltxtCustPostalCode").text();
    $("#btnMapView").attr("href","#Service_Customer_Info");
  }
  else {
    address = $("#lbltxtAddress").text() + "," + $("#lbltxtCity").text() + "," + $("#lbltxtPoCode").text();
    $("#btnMapView").attr("href","#address");
  }

  map = new google.maps.Map(document.getElementById("map-canvas"), {
    zoom: 11,
    center: new google.maps.LatLng(41.674630, 1.290680),
    mapTypeId: google.maps.MapTypeId.ROADMAP    
  });
  $( document ).bind( "pageshow", function( event, data ){
    google.maps.event.trigger(map, 'resize');
  });
  
  var infowindow = new google.maps.InfoWindow();
  var geocoder = new google.maps.Geocoder();
  geocoder.geocode( { 'address': address}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
	var marker = new google.maps.Marker({
	    map: map,
	    position: results[0].geometry.location,
	    zoom : 11,
	    animation: google.maps.Animation.BOUNCE
	});
	
	google.maps.event.addListener(marker, 'click', (function(marker) {	
	  return function() {
	    infowindow.setContent(address);
	    infowindow.open(map, marker);	  
	  }
	})(marker));
	map.setCenter(marker.getPosition());      
	google.maps.event.addListener(map,'center_changed',function() {      
	  window.setTimeout(function() {
	    map.panTo(marker.getPosition());
	  },3000);
	});
	
      } else {
	mapLocationFailed = 1;      
      }
  });
  
  /*google.maps.event.addDomListener(window, "resize", function() {
  
  }); */
  
  
}

function handleNoGeolocation(errorFlag) {
  if (errorFlag) {
    var content = 'Error: The Geolocation service failed.';
  } else {
    var content = 'Error: Your browser doesn\'t support geolocation.';
  }

  var options = {
    map: map,
    position: new google.maps.LatLng(60, 105),
    content: content
  };

  var infowindow = new google.maps.InfoWindow(options);
  map.setCenter(options.position);
}

google.maps.event.addDomListener(window, 'load', initialize);

             $(document).delegate('#content', 'pageinit', function () {
               navigator.geolocation.getCurrentPosition(initialize);
                });

// MAPS

