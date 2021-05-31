/*Функция для очистки текстовых полей форм блоков масштабирования, количества точек 
сканирования и результатов при перегрузке веб-страницы программы*/
function cle() {
  document.getElementById("nn").value = "";
  document.getElementById("tt").value = "";
  document.getElementById("err").value = "";
  document.getElementById("rz").value = "";
  document.getElementById("kto").value = "";
  document.getElementById("Mt").value = "";
  document.getElementById("scanXY").value = "";
};


/*Функция для выбора пользователем файла растрового изображения в файловой системе
 компьютера и загрузки изображения в окно браузера. Для реализации этого использует
поле формы типа файл и объект FileReader*/
function readURL() {
  clearingPull();
  var fup = document.getElementById('fig');
  var fileName = fup.value;
  var ext = fileName.substring(fileName.lastIndexOf('.') + 1);
  if (ext == "gif" || ext == "GIF" || ext == "JPEG" || ext == "jpeg" || ext == "jpg" || ext == "JPG" || ext == "png" || ext == "PNG") {
    alert("Image Successfully Uploaded");
    var im = event.target;//Создает ссылочное имя на коллекцию файлов (Объект FileList)
    var reader = new FileReader();//Объявляет переменную reader как объект FileReader
    reader.onload = function () {
      var ur = reader.result;//Передает переменной ur полный путь к файлу изображения
      document.getElementById("izo").src = ur;//Показывает изображение в окне браузера
    }
    //Получит полный путь к файлу - в результате успешного выполнения этой функции
    $("#xy-s").show();
    $("#saveXY").show();
    $("#start-point").show();
    reader.readAsDataURL(im.files[0]);
    return true;
  }
  else {
    alert("Must be jpg , png, gif images ONLY");
    document.getElementById('fig').value = '';
    return false;
  }
}

//Объявление переменных для координат
var x;
var y;

/*Объявление массивов для сканируемых точек осциллограммы*/
var U = new Array();//Массив точек сканируемой осциллограммы  (в пиклелях)
var T = new Array();//Массив точек времени (в пиклелях)
var time = new Array();//Массив точек реального времени в мкс
var lnU = new Array();//логарифмический массив точек сканированной осциллограммы

var N = 0; //Переменная количества сканированных точек
var z = 0; //Переменная порядка процесса обработки осциллограмм
var k = 1; //Объявление переменной номера строки таблицы сканированных данных
var i = 0; //Объявление переменной индекса массивов, полученных при сканировании
var To; //Переменная калибровочного времени
var Mtc;  //Переменная для масштаба времени
var Uz;  //Переменная для нулевого уровня осциллограммы
var tcon; //Переменная для постоянной времени tau
var delta; //Переменная разброса сканированных точек относительно линейной экстраполяции методом наименьших квадратов
var pog; //Переменная для относительной погрешности определения tau
var apog//Переменная для абсолютной погрешности определения tau

function clearingPull() {
  for (var m = i; m >= 0; m--) {
    $(".dat:last").remove();
    T[m] = undefined; U[m] = undefined;
  };
  k = 1; i = 0;
}
$(document).ready(function () {

  $("#start-point").hide();
  $("#saveXY").hide();
  $("#xy-s").hide();
  $("#hide-off").hide();

  $("#btn-str").click(function () {
    $("#btn-str").hide();
    $("#start-info").hide();
    $("#hide-off").show();
  });



  /*Фиксирует координаты курсора при его перемешении по загруженному изображению осциллограммы, используя событие mousemove.
   Для извлечения информации о текущей координате курсора использует свойства pageX и pageY объекта event.
  Для занесения текущих координат в скрытые поля форм с id селекторами #sx, #sy использует свойство value объекта form*/
  $("#izo").mousemove(function () {
    x = event.pageX - 331; x = x.toFixed(0);
    y = event.pageY - 56; y = y.toFixed(0);
    document.getElementById("sx").value = x;
    document.getElementById("sy").value = y;
  });


  /*Скрывает блоки с id: numb, cmt, Uzero, при нажатии кнопки "Сброс", кроме блока tau для рассчета по даннм сканирования постоянной времени переходного процесса*/
  // Очищает массивы сканированых данных и поля форм результатов
  $("#stop").click(function () {
    //Очищает массывы сканированных данных 
    for (var m = k; m >= 1; m--) {
      $(".dat:last").remove();
      T[m] = undefined; U[m] = undefined;
    };
    //Присваивает количеству сканированных точек k и индексу элементов массива i начальные значения
    k = 1; i = 0;
    //Очищает поля форм количесива точек сканирования и результатов измерения
    document.getElementById("nn").value = "";
    document.getElementById("tt").value = "";
    document.getElementById("err").value = "";
    document.getElementById("rz").value = "";
    z = 2;//Возвращает программу на этап введения количества точек сканирования
  });

  /*Вычисляет масштаб времени по двум сканированным точкам растрового изображения осциллограммы, соответствующим концам
  калибровочного интервала времени*/
  $("#mt").click(function () {
    To = document.getElementById("kto").value;
    if ((isNaN(To) == true) || (To == "")) { alert("Введите калибровочное время"); document.getElementById("kto").value = ""; $("#kto").focus(); z = 0 };
    if (T[0] == undefined) { alert("Выполните сканирование концов калибровочного отрезка времени"); z = 0 }
    else {
      if (T[1] == undefined) { alert("Не выполнено сканирование второй точки калибровочного отрезка времени"); z = 0 }
      else {
        Mtc = To / Math.abs(T[0] - T[1]); Mtc = Mtc.toFixed(4);
        document.getElementById("Mt").value = Mtc; z = z + 1;
      };
    };
  });

  /*Определяет положение нулевого уровня (переменная Uz) осциллограммы*/
  $("#zerU").click(function () {
    if (U[0] == undefined) { alert("Выполните сканирование нулевой линии осциллограммы"); z = 1 }
    else {
      if (U[1] == undefined) { alert("Не выполнено сканирование второй точки нулевой линии осциллограммы"); z = 1 }
      else {
        Uz = U[0] / 2 + U[1] / 2; z = z + 1; Uz = Uz.toFixed(0);
        alert("Uz= " + Uz + " пикселей");
        document.getElementById("prUz").value = Uz + "px";
      };
    };
  });


  /*Ввод количества точек N осциллограммы, которое необходимо сканировать*/
  $("#vnum").click(function () {
    N = document.getElementById("nn").value; z = z + 1;
    if ((isNaN(N) == true) || (N == "")) { alert("Введите количество точек сканирования."); document.getElementById("nn").value = ""; $("#nn").focus(); z = 0 };
  });


  /*Скрывает панель предыдущей обработки и открывает новую панель при нажатии на кнопку "Продолжить"*/
  $("#pro").click(function () {
    for (var m = i; m >= 0; m--) {
      $(".dat:last").remove();
      T[m] = undefined; U[m] = undefined;
    };
    k = 1; i = 0;
  });



  /*Заносит в массивы и таблицу координаты сканируемых точек при щелчке мышью (событие click).
  Для извлечения информации о текущей координате курсора использует свойства объекта event
  pageX и pageY. Для формирования строки таблицы с координатами курсора использует
  функции jQuery: find() - для нахождения тела таблицы (тег <tbody>); append() - для тобавления
  тегов строки таблицы с ячейками, в которые занесены значения координат.*/
  $("#izo").click(function () {
    x = event.pageX - 331; x = x.toFixed(0);
    y = event.pageY - 56; y = y.toFixed(0);
    T[i] = x; U[i] = y;//Заносит координаты сканированной точки в массивы
    //Заносит координаты в таблицу сканированных данных
    $('#saveXY').find("tbody").append("<tr class='dat'><th>" + k + "</th><th>" + x + "</th><th>" + y + "</th></tr>");
    i = i + 1; k = k + 1;
    if (z == 3) {
      if (k > N) { alert("Сканирование осциллограммы закончено!") }
    };
  });


  /*Удаляет последнюю строку таблицы при нажaтии на кнопку "Удалить строку",
  уменьшает на единицу номер строки k и индекс элементов массива сканированных точек i*/
  $("#del").click(function () {
    $(".dat:last").remove();
    k = k - 1; i = i - 1; T[k] = undefined;
    U[k] = undefined;
  });


  /*Вычисляет постоянную времени экспоненциального импульса напряжения и погрешности, используя предварительно полученный
  при сканировании осциллограммы массив точек*/
  $("#ctau").click(function () {
    var lnUs = 0;
    var times = 0;
    var time2s = 0;
    var lnUtime = 0;
    var dels = 0;
    var ct; var ct1; var ct2;
    var a;
    var b;
    var vspom;
    //Формирует из массива T массив точек реального времени time и преобразует массив U в логарифмический массив lnU
    if (T[N - 1] == undefined) { alert("Сканирование не закончено ! Продолжить сканирование") }
    else {
      for (var m = 0; m <= N - 1; m++) {
        time[m] = Mtc * (Math.abs(T[m] - T[0]));
        lnU[m] = Math.log(Math.abs(Uz - U[m]));
      };

      /*Реализует метод наименьших квадратов для нахождения коэффициентов a и b прямой линии lnU=a*time + b, проведенной через точки
      функциональной зависимости lnU=f(time). Используя значение коэффициента a вычисляет постоянную времени tau, как tau=1/a.*/
      for (var m = 0; m <= N - 1; m++) {
        lnUs = lnUs + lnU[m];
        times = times + time[m];
        time2s = time2s + time[m] * time[m];
        lnUtime = lnUtime + lnU[m] * time[m];
      };
      a = (N * lnUtime - lnUs * times) / (N * time2s - times * times);
      b = lnUs / N - a * times / N;
      ct = Math.abs(1 / a);
      //Выводит значение tau в предназначенное для него поле формы
      document.getElementById("tt").value = ct.toFixed(1);


      /*Вычисляет относительный разброс экспериментальных точек относительно прямой линейной экстраполяции lnU=a*time + b
      и погрещность err определения постоянной времени tau*/
      for (var m = 0; m <= N - 1; m++) {
        dels = dels + (lnU[m] - a * time[m] - b) * (lnU[m] - a * time[m] - b);
      };
      dels = dels / N;
      dels = Math.sqrt(dels);
      vspom = Math.abs(time[N - 1] - time[0]);
      apog = 2 * dels / (a * a * vspom);
      pog = 2 * dels * 100 / (Math.abs(a * vspom));
      //Выводит значение абсолютной и относительной ошибок определения  tau в предназначенные для них поля форм
      document.getElementById("err").value = pog.toFixed(1);
      document.getElementById("rz").value = apog.toFixed(1);
    };

  });
});//Конец функции ready()
