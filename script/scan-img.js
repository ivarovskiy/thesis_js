/*Функция для очистки текстовых полей форм блоков масштабирования, количества точек 
сканирования и результатов при перегрузке веб-страницы программы*/
function cle(){
    document.getElementById("nn").value="";
    document.getElementById("tt").value="";
    document.getElementById("err").value="";
    document.getElementById("rz").value="";
    document.getElementById("kto").value="";
    document.getElementById("Mt").value="";
    document.getElementById("scanXY").value="";
    };


    /*Функция для выбора пользователем файла растрового изображения в файловой системе
     компьютера и загрузки изображения в окно браузера. Для реализации этого использует
    поле формы типа файл и объект FileReader*/
    function readURL(){
        clearingPull();
         var fup = document.getElementById('fig');
         var fileName = fup.value;
         var ext = fileName.substring(fileName.lastIndexOf('.') + 1);
    if(ext == "gif" || ext == "GIF" || ext == "JPEG" || ext == "jpeg" || ext == "jpg" || ext == "JPG")
    {   
            alert("Image Successfully Uploaded");
            var im=event.target;//Создает ссылочное имя на коллекцию файлов (Объект FileList)
            var reader = new FileReader();//Объявляет переменную reader как объект FileReader
            reader.onload = function () 
            {
                var ur=reader.result;//Передает переменной ur полный путь к файлу изображения
                document.getElementById("izo").src = ur;//Показывает изображение в окне браузера
            }
    //Получит полный путь к файлу - в результате успешного выполнения этой функции
            $("#xy-s").show();
            $("#saveXY").show();
            $("#start-point").show();
            reader.readAsDataURL(im.files[0]);
            return true;
        }
    else
        {
            alert("Must be jpg and gif images ONLY");
            document.getElementById('fig').value='';
        return false;
        }
    }
    
    
    