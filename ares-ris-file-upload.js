/* ares-ris-file-upload - https://github.com/cu-library/ares-ris-file-upload */

/* Create a AresRISFileUpload namespace by creating an empty object,
   in which we can define our data and functions. */
var AresRISFileUpload = AresRISFileUpload || {};

/* Init function. */
AresRISFileUpload.init = function (jq) {

    "use strict";
    var parent = AresRISFileUpload;
    parent.jq = jq;

    if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
      alert('The File APIs are not fully supported in this browser. Not showing the option to upload RIS files.');
      return;
    } 
   
    var appendLink = '<span style="float:left; text-align: center; margin: 5px; padding: 20px;">\n';
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
        }
        console.log("done processing");
    });      
    
};

AresRISFileUpload.processupload = function( risfile ) {
    "use strict";
    var parent = AresRISFileUpload;
    var jq = parent.jq;
    
    parent.addoutputdivtoDOMifmissing();
    
    var reader = new FileReader();
    reader.onload = function( event ) { 
        var contents = event.target.result;        
        parent.processcontents(contents.split("\n"));
     }
     reader.readAsText(risfile);    
}

AresRISFileUpload.processcontents = function( risfilearray ) {
    "use strict";
    var parent = AresRISFileUpload;
    var jq = parent.jq;    
   
    var index = 0;
    
    var item = {
        "id": index,    
    };

    while (risfilearray.length > 0) {
        var nextline = jq.trim(risfilearray.shift()); 
        
        console.log(nextline);
        
        var tag = nextline.substring(0,2);
        var value = "";
        if (nextline.length > 6) {         
            value = nextline.substring(6, nextline.length);
        }
        
        if (tag == "ER") {
            parent.outputItemToDOM(item);
            console.log(item);
            index += 1;
            item = {
                "id": index,
            };
        } else if (tag != "") {
            item[tag] = value;
        } 
    } 

    jq("#risoutput").append('<div class="ristotal">Added '+index+' items to Ares.</div>'); 
}

AresRISFileUpload.outputItemToDOM = function( item ) {
    "use strict";
    var parent = AresRISFileUpload;
    var jq = parent.jq;       
   
    var itemappend = '<div class="risitem" style="margin-bottom:1rem;">';
    for (var prop in item){ 
        var tag = "";   
        var value = "";        
        switch (prop) {
            case "T1":
                tag = "Title";
                value = item[prop];
                break;
            case "TY":
                tag = "Type";
                switch (item[prop]) {
                    case "JOUR":
                        value = "Article";
                        break;
                    case "BOOK":
                        value = "Book / e-Book";
                        break;
                    case "CHAP":
                        value = "Chapter";
                        break;
                }
                break;               
        }        
        if (tag !== "" && value !== ""){ 
            itemappend +=    '  <strong>'+tag+': </strong>'+value+'<br />'; 
        }
    }
    itemappend +=    '</div>';

    jq("#risoutput").append(itemappend);    
}

AresRISFileUpload.addoutputdivtoDOMifmissing = function() {
    "use strict";
    var parent = AresRISFileUpload;
    var jq = parent.jq;

    if ( !jq("#risoutput").length ){    
        var appenddiv = '<div id="risoutput" style="clear:left;"></div>'
        jq("#content div:first-child").append(appenddiv);    
    }    
}