<?php

//print "mailform"

function check_email($email2check) {
if(preg_match("/[a-z]+[a-z.-_]+@[a-z.-_]+\.+[a-z]+/i",$email2check)) 
return  TRUE;
else return FALSE;
}

function presenteer_formulier() {

$zelfactie = $_SERVER['PHP_SELF'];


print "\n<form method='post' action='$zelfactie'>";
print "\n<table border='0'>";

print "\n<tr><td>Name: </td><td><input type='text' name='name' maxlength='127'";
if ($_POST['name']) { print " value='".$_POST['name']."'"; };
print "></td></tr>";

print "\n<tr><td>E-mail address: </td><td><input type='text' name='email' maxlength='127'";
if ($_POST['email']) { print " value='".$_POST['email']."'"; };
print "></td></tr>";

print "\n<tr><td>Subject: </td><td><input type='text' name='subject' maxlength='127'";
if ($_POST['subject']) { print " value='".$_POST['subject']."'"; };
print "></td></tr>";

print "\n<tr><td valign='top'>Message: </td><td><textarea name='message' rows='10' cols='30' maxlength='1023'>";
if ($_POST['message']) { print "".$_POST['message']; };
print "</textarea></td></tr>";

print "\n<tr><td> &nbsp;</td><td align='right'><input type='submit' name='verzend' value='Send' /></td></tr>";
print "\n</table>";
print "\n</form>";

}


function verstuur_email() {

  //Ipadres verkrijgen
  if(getenv($_SERVER['HTTP_X_FORWARDED_FOR'])) {  
    $ipadres = getenv($_SERVER['HTTP_X_FORWARDED_FOR']);  
  } elseif(getenv($_SERVER['HTTP_CLIENT_IP'])) {  
    $ipadres = getenv($_SERVER['HTTP_CLIENT_IP']);  
  } else {  
    $ipadres = $_SERVER['REMOTE_ADDR'];  
  }

  //Host verkrijgen
  $hostmask = gethostbyaddr($ipadres);

  $fanname = $_POST['name'];
  $fromfan = $_POST['email'];
  $subject = $_POST['subject'];
  $message = $_POST['message'];

  $address = "mariusthart@gmail.com";
  $mailheaders = "From: ".$fanname." <".$fromfan.">\r\n";


  if (!$_POST['message']) {
    $ok = false;
  } else {
    $message_ip = "
    ".$_POST['message']." 

NOTE:        ".$_POST['name']." sent this mail on ".date("d-m-Y")." at ".date("H:i").". 

             IP address of ".$_POST['name'].": ".$ipadres." 
             Hostaddress of ".$_POST['name'].": ".$hostmask." 
";
  }


  if (check_email($fromfan)) {

    mail($address, $subject, $message_ip, $mailheaders);
    print "<font color='black'><b>Your message has been sent.</b></font>";

  } else {

    print "<font color='black'><b>Please fill in the form completely and correctly.</b></font><br />";
    presenteer_formulier();

  }

}


if (isset($_POST['email'])) {

  verstuur_email();

} else {

  print " &nbsp;<br \>";
  presenteer_formulier();

}

?>

