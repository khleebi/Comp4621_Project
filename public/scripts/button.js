$('.trigger_About').click(()=>{
    $('#About_hover').show();
 });
 $('#popupCloseButton_About').click(()=>{
     $('#About_hover').hide();
 });

 $('.trigger_Help').click(()=>{
    $('#Help_hover').show();
 });

 $('#popupCloseButton_Help').click(()=>{
     $('#Help_hover').hide();
 });

$('#linkCreateAccount').click(()=>{
    $("#signin-form").hide();
    $("#register-form").show();
});


$('#linkLogin').click(()=>{
    $("#register-form").hide();
    $("#signin-form").show();
});



