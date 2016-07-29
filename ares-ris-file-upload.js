/* ares-ris-file-upload - https://github.com/cu-library/ares-ris-file-upload */

/* Create a AresRISFileUpload namespace by creating an empty object,
   in which we can define our data and functions. */
var AresRISFileUpload = AresRISFileUpload || {};

/* Init function. */
AresRISFileUpload.init = function(jq, courseID) {

    "use strict";
    var parent = AresRISFileUpload;
    parent.jq = jq;
    parent.courseID = courseID;
    parent.items = [];
    parent.totalitems = 0;
    
    if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
      console.log('The File APIs are not fully supported in this browser. Not showing the option to upload RIS files.');
      return;
    } 
    
    //Add the CSS file to the head of the document.
    jq('head').append('<link rel="stylesheet" href="css/ares-ris-file-upload.css" type="text/css">');

    jq("#content div:first-child").append('<hr>');
   
    parent.addFileInput();  
};

AresRISFileUpload.addFileInput = function() {
    "use strict";
    var parent = AresRISFileUpload;
    var jq = parent.jq; 

    var appenddiv = '<div id="risoutput"></div>'
    jq("#content div:first-child").append(appenddiv);  

    var appendLink = '<span id="risupload">\n';
    appendLink +=    '  <img src="images/Large/favs_32.gif" height="32" width="32" alt="Upload RIS File" title="Upload RIS File">';
    appendLink +=    '  <br>';
    appendLink +=    '  <span aria-hidden="true">Upload RIS File</span>';
    appendLink +=    '  <br>';
    appendLink +=    '  <input type="file" id="risfileinput" accept=".ris">';
    appendLink +=    '</span>';    
    jq("#content div:first-child").append(appendLink);
        
    jq("#risfileinput").change( function( event ) {
        if (event.target.files.length == 1){        
            parent.processupload(event.target.files[0]);
            jq("#risupload").remove();                       
        }
    });   
}

AresRISFileUpload.processupload = function( risfile ) {
    "use strict";
    var parent = AresRISFileUpload;

    var reader = new FileReader();
    reader.onload = function( event ) {  
        parent.processFile(event.target.result);
        parent.totalitems = parent.items.length;       
        parent.processItemsWithFormFrames();
    }
    reader.readAsText(risfile);
}

AresRISFileUpload.processFile = function( risfilecontents ) {
    "use strict";
    var parent = AresRISFileUpload;
    var jq = parent.jq;    
   
    var index = 0;
    
    var item = {
        "id": index, 
    };   

    var risfilearray = risfilecontents.split("\n");

    while (risfilearray.length > 0) {
        var nextline = jq.trim(risfilearray.shift());               
        var tag = nextline.substring(0,2);
        var value = "";
        if (nextline.length > 6) {         
            value = nextline.substring(6, nextline.length);
        }        
        if (tag == "ER") {
        
            // Reached the end of the record. Make sure required fields
            // are there or unknown.
            item['TY'] = item['TY'] || "Unknown";      
            switch (item['TY']) {
                case "JOUR":
                    item['TY'] = "Article";
                    break;
                case "BOOK":
                    item['TY'] = "Book / e-Book";
                    break;
                case "CHAP":
                    item['TY'] = "Chapter";
                    break;
            }    
            item['T1'] = item['T1'] || item['TI'] || "Unknown";    
            item['A1'] = item['A1'] || item['AU'] || "Unknown";    
            item['Y1'] = item['Y1'] || item['PY'] || "Unknown";
            item['JF'] = item['JF'] || item['T2'] || "Unknown";  
            item['JF'] = item['JF'].split(" ").map(function(i){return i[0].toUpperCase() + i.substring(1).toLowerCase()}).join(" ");
            item['SP'] = item['SP'] || "Unknown";              
            item['EP'] = item['EP'] || "Unknown";  
            
            item['VL'] = item['VL'] || "";
            item['IS'] = item['IS'] || "",
            item['SN'] = item['SN'] || "",
            item['DO'] = item['DO'] || "",
            item['UR'] = item['UR'] || "",
            
            parent.items.push(item);         
                      
            index += 1;     

            item = {
                "id": index,
            };           

        } else if (tag != "") {
            if (tag in item) {
                item[tag] = item[tag] + ", " + value;                      
            } else {
                item[tag] = value;
            }            
        } 
    }     

}

AresRISFileUpload.processItemsWithFormFrames = function() {
    "use strict";
    var parent = AresRISFileUpload;
    var jq = parent.jq;   
    
    if (parent.items.length == 0){
        jq("#risoutput").html('<span>Processing complete!</span><hr>'); 
        parent.addFileInput(); 
        return;
    }
    
    var item = parent.items.shift();
    
    jq("#risoutput").html('<span>Processed '+(parent.totalitems - parent.items.length)+'/'+parent.totalitems+ '</span>');  
    
    jq("#risoutput").append('<iframe id="risiframe" style="display: none;"/></iframe>');  

    var iframepath = '/ares.dll';
    var iframesearch = '?SessionID='+sessionid+'&CourseID='+parent.courseID;
    
    jq('#risiframe').load( function() {
        var content = jq(this).contents();
        content.find("#header").hide();
        content.find("#footer").hide();
        content.find("#content-wrap").css("margin-top", "0px");
        content.find("#content").css("margin", "0px");

        var skiplinkurl = iframepath+iframesearch+'&Action=10&Form=60';          

        content.find('form[name=createitem] fieldset').first().append('<a id="risskip" style="margin-left: 10px;" href="'+skiplinkurl+'">Skip This Item</a>');
    });   
    

    switch (item['TY']) {
        case "Article":     
                
            var iframeurl = iframepath+iframesearch+'&Action=10&Form=2&Value=IRFArticle';  
            
            jq('#risiframe').load( function() {
                var iframecurrentsearch = jq(this).get(0).contentWindow.location.search; 
                var iframecurrentpath = jq(this).get(0).contentWindow.location.path;             
                if ((iframecurrentsearch.indexOf("Action=10") >= 0) && (iframecurrentsearch.indexOf("Form=60") >= 0)){
                    jq(this).remove();
                    parent.processItemsWithFormFrames();
                } else if (iframecurrentsearch == iframesearch+'&Action=10&Form=2&Value=IRFArticle'){
                    var content = jq(this).contents();
                    content.find("#Title").val(item['JF']);
                    content.find("#Volume").val(item['VL']);
                    content.find("#Issue").val(item['IS']);
                    content.find("#JournalYear").val(item['Y1']);
                    content.find("#ArticleTitle").val(item['T1']);
                    content.find("#Author").val(item['A1']);
                    content.find("#ISXN").val(item['SN']);
                    content.find("#DOI").val(item['DO']);
                    content.find("#Pages").val(item['SP'] + ' - ' + item['EP']);
                    content.find("#URL").val(item['UR']);
                    content.find("#WebLink").attr("checked", "checked");
                    jq(this).css('display', 'inline');
                }
            }); 
            
            jq('#risiframe').attr("src", iframeurl);          
            break;            
        case "Book / e-Book":
            jq('#risiframe').remove();
            parent.processItemsWithFormFrames();
            break;
        case "Chapter":
            jq('#risiframe').remove();
            parent.processItemsWithFormFrames();
            break;  
        default:
            jq('#risiframe').remove();
            parent.processItemsWithFormFrames();
    } 
    
}