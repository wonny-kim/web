<?php
/*
    common function
*/
function file_name($name,$type,$ext='php') {
  switch($type) {
    case "inc" :
    return "_".$name.".".$ext;
    breek;
    default :
    return $name.".".$ext;
    break;
  }
}
?>
