<?PHP

$key = $ini_array['key'];
use \Firebase\JWT\JWT;
require_once "/var/www/html/vendor/autoload.php";
$jwt =  mysqli_real_escape_string($conn,$_REQUEST["JWT"]);  
$jwt_array = (array) JWT::decode($jwt, $key, array('HS256'));
return $jwt_array;

?>