/**
 * 全局变量声明区域
 */

// 运动数据相关变量
var miles, speeds, username, keep_title, date_year, date_month, date_day, time_hour, time_min, temperature, humidity, savePic_width;

// 图片源相关变量
var bgSRC = "", ptSRC = "";  // 背景图和头像图片源
var display_guijiSelect_id;   // 当前选择的轨迹ID
var default_bgSRC = [];       // 默认背景图数组
var use_default_bg = true;    // 是否使用默认背景

// 画布相关变量
var canvas, ctx, drawdown, convasData, current_img_width, current_img_height, draw_suofang, buffer_canvas;

// 轨迹绘制相关变量
var bs_range_min, bs_range_max;  // 轨迹范围最小值和最大值
var bs, bs_prob, is_bs, bs_max, bs_range, bs_now, bs_start_x, bs_start_y, bs_end_x, bs_end_y, bs_pres_x, bs_pres_y, bs_pres_color;
var draw_start_x, draw_start_y, draw_end_x, draw_end_y;

// 资源文件路径（添加时间戳防止缓存）
var empty_bg_src = "images/empty_bg.png" + "?_=" + new Date().getTime();        // 空白背景
var gui_img_src = "images/1.png" + "?_=" + new Date().getTime();               // 轨迹图片
var default_portrait_scr = "images/default_portrait.png" + "?_=" + new Date().getTime();  // 默认头像
var start_sign_src = "images/start.png" + "?_=" + new Date().getTime();        // 起点标记
var end_sign_src = "images/end.png" + "?_=" + new Date().getTime();            // 终点标记

// 尺寸常量
var frameWidth = 300;   // 框架宽度
var frameHeight = 600;  // 框架高度

var bgWidth = 360;      // 背景宽度
var bgHeight = 719;     // 背景高度

let ptWidth = 40;       // 头像宽度
let ptHeight = 40;      // 头像高度

/**
 * 工具函数区域
 */

/**
 * 获取数字的小数部分
 * @param {number} num - 输入数字
 * @return {number} 返回数字的小数部分
 */
function fract(num) {
    return num - Math.trunc(num);
}

/**
 * 数字前补零（个位数补零）
 * @param {number} i - 输入数字
 * @return {string} 补零后的字符串
 */
function addZero(i) {
    if (i < 10) {
        i = "0" + String(i);
        return i;
    }
    return String(i);
}

/**
 * 处理日期选择器的值并更新全局日期变量
 * 从日期选择器获取值，解析为年月日并更新全局变量，然后重新渲染
 */
function setDateFromDatePicker() {
    const dateValue = document.getElementById("inpt_date").value; // 格式为 YYYY-MM-DD
    if (dateValue) {
        const dateParts = dateValue.split('-');
        date_year = parseInt(dateParts[0]);
        date_month = parseInt(dateParts[1]);
        date_day = parseInt(dateParts[2]);
        rander(); // 更新渲染
    }
}

/**
 * 处理时间选择器的值并更新全局时间变量
 */
function setTimeFromTimePicker() {
    const timeValue = document.getElementById("inpt_time").value; // 格式为 HH:MM
    if (timeValue) {
        const timeParts = timeValue.split(':');
        time_hour = parseInt(timeParts[0]);
        time_min = parseInt(timeParts[1]);
        rander();
    }
}

//将输入框的输入内容存储到对应的变量中
function setData() {
    username      = document.getElementById("inpt_username").value;
    keep_title    = document.getElementById("inpt_keep_title").value;
    miles         = parseFloat(document.getElementById("inpt_miles").value);
    speeds        = parseFloat(document.getElementById("inpt_speeds").value);
    temperature   = parseInt(document.getElementById("inpt_temperature").value);
    humidity      = parseInt(document.getElementById("inpt_humidity").value);
    bs_prob       = parseFloat(document.getElementById("inpt_bs_prob").value);
    bs_range_min  = parseInt(document.getElementById("inpt_bs_range_min").value);
    bs_range_max  = parseInt(document.getElementById("inpt_bs_range_max").value);
    savePic_width = parseInt(document.getElementById("inpt_savePic_width").value);
    rander();
}

// 此函数已被移除，功能已整合到window.onload中
function initInputData() {
    // 此函数已不再使用
    console.log("initInputData函数已被弃用，所有初始化逻辑已移至window.onload");
}

//渲染, 将输入的内容放到图片的对应位置
function rander() {
    let miles_int = Math.floor(miles);
    let miles_dec = Math.round((miles - miles_int) * 100);
    let speeds_int = Math.floor(speeds);
    let speeds_dec = Math.round((speeds - speeds_int) * 100);
    let times = (speeds_dec / 60 + speeds_int) * miles;
    let timeInc = Math.trunc(times);
    let cost_hour = Math.floor(timeInc / 60);
    let cost_min = timeInc % 60;
    let cost_sec = Math.round((times - timeInc) * 60);
    let calorie = Math.round(69 * miles * 1.036);
    document.getElementById("mile").innerHTML = String(miles_int) + "." + String(addZero(miles_dec));
    document.getElementById("date").innerHTML = String(date_year) + "/" + addZero(date_month) + "/" + addZero(date_day);
    document.getElementById("time").innerHTML = addZero(time_hour) + ":" + addZero(time_min);
    document.getElementById("temperature").innerHTML = String(temperature) + "℃";
    document.getElementById("humidity").innerHTML = String(humidity) + "%";
    document.getElementById("username").innerHTML = username;
    document.getElementById("keep-title").innerHTML = "Keep&nbsp;•&nbsp;" + keep_title;
    localStorage.setItem('username', username); // 保存用户名到localStorage
    localStorage.setItem('keep_title', keep_title); // 保存标题到localStorage
    
    document.getElementById("speed").innerHTML = String(addZero(speeds_int)) + "'" + String(addZero(speeds_dec)) + '"';
    document.getElementById("cost-time").innerHTML = String(addZero(cost_hour)) + ":" + String(addZero(cost_min)) + ":" + String(addZero(cost_sec));
    document.getElementById("calorie").innerHTML = addZero(calorie);
}

//选择预设图片
function default_bgImgSelect_onChange() {
    if (display_guijiSelect_id) {
        document.getElementById(display_guijiSelect_id).style.display = "none";
    }
    display_guijiSelect_id = document.getElementById("default_bgImgSelect").value;
    document.getElementById(display_guijiSelect_id).style.display = "inline"
    default_bgSRC = eval(document.getElementById(display_guijiSelect_id).value);
    setbgImg(default_bgSRC[0]);
}
function guijiSelect_onChange() {
    default_bgSRC = eval(document.getElementById(display_guijiSelect_id).value);
    setbgImg(default_bgSRC[0]);
}
//选择天气
function weather_Select_onChange() {
    document.getElementById("weather").src = document.getElementById("weather_Select").value;
}

function dataURLtoBlob(dataurl) {
    var arr = dataurl.split(',');
    var mime = arr[0].match(/:(.*?);/)[1];
    var bstr = atob(arr[1]);
    var n = bstr.length;
    var u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {
        type: mime
    });
}

//按下更改背景图片的按钮时调用的方法
function inpt_bgimg_onClick() {
    document.getElementById("inpt_bgimg").click();
}
//按下更改头像的按钮时调用的方法
function inpt_portrait_onClick() {
    document.getElementById("inpt_portrait").click();
}
//选择并设置背景图片
function bgimg_inpt() {
    var bgimg_oFReader = new FileReader();
    bgimg_oFReader.onload = function (event) {
        var bgimg_osrc = event.target.result;
        if (bgSRC) {
            URL.revokeObjectURL(bgSRC);
        }
        // 保存原始自定义背景
        localStorage.setItem('userBackground_original', bgimg_osrc);
        // 移除之前绘制的背景，因为我们有了新的原始背景
        localStorage.removeItem('userBackground_drawn');

        bgSRC = URL.createObjectURL(dataURLtoBlob(bgimg_osrc));
        let IMG = new Image();
        IMG.src = bgSRC;
        setbgImg(bgSRC);
        use_default_bg = false;
        document.getElementById("setbgimg_reset_btn").className = "";
    }
    var bgimg_ofile = document.getElementById("inpt_bgimg").files[0];
    bgimg_oFReader.readAsDataURL(bgimg_ofile);
}
function setbgImg(src) {
    document.getElementById("bg-img").src = src;
    document.getElementById("bg-img").onload = function() {
        getNaturalSize();
    }
    let IMG = new Image();
    IMG.src = src;
    IMG.onload = function(){
        getNaturalSize();
        if(parseInt(IMG.width) / parseInt(IMG.height) > 0.5010) {
            document.getElementById("bg-img").style.height = String(bgHeight) + "px";
            document.getElementById("bg-img").style.width = String(parseInt(IMG.width) * bgHeight / parseInt(IMG.height)) + "px";
        } else {
            document.getElementById("bg-img").style.height = String(parseInt(IMG.height) * bgWidth / parseInt(IMG.width)) + "px";
            document.getElementById("bg-img").style.width = String(bgWidth) + "px";
        }
    }
}

//选择并设置头像
function portrait_inpt() {
    var portrait_oFReader = new FileReader();
    portrait_oFReader.onload = function (event) {
        var portrait_osrc = event.target.result;
        if (ptSRC) {
            URL.revokeObjectURL(ptSRC)
        }
        ptSRC = URL.createObjectURL(dataURLtoBlob(portrait_osrc));
        document.getElementById("portrait").src = ptSRC;
        let IMG = new Image();
        IMG.src = ptSRC;
        IMG.onload = function() {
            if(parseInt(IMG.width) / parseInt(IMG.height) > 1){
                document.getElementById("portrait").style.height = String(ptHeight) + "px";
                document.getElementById("portrait").style.width = String(parseInt(IMG.width) * ptHeight / parseInt(IMG.height)) + "px";
            }else{
                document.getElementById("portrait").style.height = String(parseInt(IMG.height) * ptWidth / parseInt(IMG.width)) + "px";
                document.getElementById("portrait").style.width = String(ptWidth) + "px";
            }
            document.getElementById("setpt_reset_btn").className = "";
        }
        localStorage.setItem('userPortrait', portrait_osrc); // 保存头像Base64到localStorage
    }
    var portrait_ofile = document.getElementById("inpt_portrait").files[0];
    portrait_oFReader.readAsDataURL(portrait_ofile);
}
//恢复默认背景图片
function init_bgimg() {
    setbgImg(default_bgSRC[0]);
    use_default_bg = true;
    document.getElementById("setbgimg_reset_btn").className = "init-btn";
    // 清除localStorage中保存的自定义背景
    localStorage.removeItem('userBackground_original');
    localStorage.removeItem('userBackground_drawn');
}
//恢复默认头像
function init_portrait() {
    document.getElementById("portrait").style.height = ptHeight;
    document.getElementById("portrait").style.width = ptHeight;
    document.getElementById("portrait").src = default_portrait_scr;
    document.getElementById("setpt_reset_btn").className = "init-btn";
}

/*----- 以下为[绘制自定义轨迹]用到的方法 -----*/
function inpt_drawbtn_onClick() {
    if(current_img_width / current_img_height > 0.5010) {
        draw_suofang = current_img_height / frameHeight;
        document.getElementById("drawpic_canvas_wrap").innerHTML = '<canvas id="drawpic_canvas" width="' + String(current_img_width) + '" height="' + String(current_img_height) + '" style="width: ' + String(Math.floor(current_img_width * (frameHeight / current_img_height))) + 'px; height: ' + String(frameHeight) + 'px;"></canvas>';
    } else {
        draw_suofang = current_img_width / frameWidth;
        document.getElementById("drawpic_canvas_wrap").innerHTML = '<canvas id="drawpic_canvas" width="' + String(current_img_width) + '" height="' + String(current_img_height) + '" style="width: ' + String(frameWidth) + 'px; height: ' + String(Math.floor(current_img_height * (frameWidth / current_img_width))) + 'px;"></canvas>';
    }
    document.getElementById("drawpic_overlay").classList.add("active");
    document.getElementById("body").style.overflow = "hidden";
    document.getElementById("body").style.height = "100%";
    start_draw();
}
function inpt_colorchange_checkbox_onchange() {
    bs = document.getElementById("inpt_colorchange_checkbox").checked;
    if (bs) {
        document.getElementById("bs_prop_inpt_wrap").style.display = "list-item";
        document.getElementById("inpt_bs_range_wrap").style.display = "list-item";
    } else {
        document.getElementById("bs_prop_inpt_wrap").style.display = "none";
        document.getElementById("inpt_bs_range_wrap").style.display = "none";
    }
}
function start_draw() {
    if (bs) {
        handlePointerDown = (e) => {
            // 只有当事件发生在canvas上时才开始绘制
            if (e.target !== canvas) return;

            ctx.beginPath();
            ctx.lineJoin = "round";
            ctx.lineCap = "round";
            ctx.lineWidth = Math.floor(5 * draw_suofang);
            bs_pres_color = new Array(38, 201, 154);
            if (drawdown == false) {
                draw_start_x = e.offsetX * draw_suofang;
                draw_start_y = e.offsetY * draw_suofang;
                ctx.strokeStyle = "rgb(38, 201, 154)".toString();
            }
            drawdown = true;
            bs_pres_x = e.offsetX * draw_suofang;
            bs_pres_y = e.offsetY * draw_suofang;
            ctx.moveTo(e.offsetX * draw_suofang, e.offsetY * draw_suofang);

            // 在document上添加move和up事件监听器
            document.addEventListener('pointermove', handlePointerMove);
            document.addEventListener('pointerup', handlePointerUp);
        };

        handlePointerMove = (e) => {
            if (drawdown) {
                // 确保e.offsetX和e.offsetY是相对于canvas的
                const rect = canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                if (is_bs) {
                    if (bs_now >= bs_range) {
                        is_bs = false;
                        ctx.beginPath();
                        ctx.lineJoin = "round";
                        ctx.lineCap = "round";
                        ctx.lineWidth = Math.floor(5 * draw_suofang);
                        ctx.moveTo(bs_pres_x, bs_pres_y);
                        ctx.lineTo(x * draw_suofang, y * draw_suofang);
                        var gradient = ctx.createLinearGradient(bs_pres_x, bs_pres_y, x * draw_suofang, y * draw_suofang);
                        gradient.addColorStop(0, "rgb(" + String(bs_pres_color[0]) + "," + String(bs_pres_color[1]) + " ," + String(bs_pres_color[2]) + " )");
                        gradient.addColorStop(1, "rgb(38, 201, 154)");
                        ctx.strokeStyle = gradient;
                        ctx.stroke();
                        bs_pres_color = new Array(38, 201, 154);
                    }
                }
                if (Math.random() < bs_prob && is_bs == false) {
                    is_bs = true;
                    rg = 2 * Math.random() - 1;
                    if (rg > 0) {
                        bs_max = new Array(Math.floor(193 * Math.pow(Math.abs(rg), 0.5)), Math.floor(-110 * Math.pow(Math.abs(rg), 0.5)), Math.floor(-66 * Math.pow(Math.abs(rg), 0.5)));
                    } else {
                        bs_max = new Array(Math.floor(27 * Math.pow(Math.abs(rg), 0.5)), Math.floor(16 * Math.pow(Math.abs(rg), 0.5)), Math.floor(94 * Math.pow(Math.abs(rg), 0.5)));
                    }
                    bs_range = bs_range_min + Math.floor((bs_range_max - bs_range_min) * Math.random());
                    bs_now = 0;
                }
                if (is_bs) {
                    ctx.beginPath();
                    ctx.lineJoin = "round";
                    ctx.lineCap = "round";
                    ctx.lineWidth = Math.floor(5 * draw_suofang);
                    ctx.moveTo(bs_pres_x, bs_pres_y);
                    var bs_now_color = new Array(Math.floor(38 + (4 * bs_max[0] * bs_now / bs_range) * (1 - bs_now / bs_range)), Math.floor(201 + (4 * bs_max[1] * bs_now / bs_range) * (1 - bs_now / bs_range)), Math.floor(154 + (4 * bs_max[2] * bs_now / bs_range) * (1 - bs_now / bs_range)))
                    var gradient = ctx.createLinearGradient(bs_pres_x, bs_pres_y, x * draw_suofang, y * draw_suofang);
                    gradient.addColorStop(0, "rgb(" + String(bs_pres_color[0]) + "," + String(bs_pres_color[1]) + " ," + String(bs_pres_color[2]) + " )");
                    gradient.addColorStop(1, "rgb(" + String(bs_now_color[0]) + "," + String(bs_now_color[1]) + " ," + String(bs_now_color[2]) + " )");
                    ctx.strokeStyle = gradient;
                    ctx.lineTo(x * draw_suofang, y * draw_suofang);
                    ctx.stroke();
                    bs_pres_color = bs_now_color;
                    bs_now += 1
                } else {
                    ctx.lineTo(x * draw_suofang, y * draw_suofang);
                    ctx.strokeStyle = "rgb(38, 201, 154)".toString();
                    ctx.stroke();
                }
                bs_pres_x = x * draw_suofang;
                bs_pres_y = y * draw_suofang;
            }
        };

        handlePointerUp = (e) => {
            // 移除document上的事件监听器
            document.removeEventListener('pointermove', handlePointerMove);
            document.removeEventListener('pointerup', handlePointerUp);

            const rect = canvas.getBoundingClientRect();
            draw_end_x = (e.clientX - rect.left) * draw_suofang;
            draw_end_y = (e.clientY - rect.top) * draw_suofang;
            var startIMG = new Image();
            var endIMG = new Image();
            startIMG.src = start_sign_src;
            endIMG.src = end_sign_src;
            startIMG.onload = function () {
                ctx.drawImage(startIMG, Math.floor(draw_start_x - 15 * draw_suofang), Math.floor(draw_start_y - 22 * draw_suofang), Math.floor(30 * draw_suofang), Math.floor(30 * draw_suofang));
            }
            endIMG.onload = function () {
                ctx.drawImage(endIMG, Math.floor(draw_end_x - 15 * draw_suofang), Math.floor(draw_end_y - 22 * draw_suofang), Math.floor(30 * draw_suofang), Math.floor(30 * draw_suofang));
            }
            convasData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            drawdown = false;
            restorePointer();
        };
    } else {
        handlePointerDown = (e) => {
            // 只有当事件发生在canvas上时才开始绘制
            if (e.target !== canvas) return;

            ctx.beginPath();
            if (drawdown == false) {
                draw_start_x = e.offsetX * draw_suofang;
                draw_start_y = e.offsetY * draw_suofang;
            }
            drawdown = true;
            ctx.moveTo(e.offsetX * draw_suofang, e.offsetY * draw_suofang);

            // 在document上添加move和up事件监听器
            document.addEventListener('pointermove', handlePointerMove);
            document.addEventListener('pointerup', handlePointerUp);
        };

        handlePointerMove = (e) => {
            if (drawdown) {
                // 确保e.offsetX和e.offsetY是相对于canvas的
                const rect = canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                ctx.lineTo(x * draw_suofang, y * draw_suofang);
                ctx.strokeStyle = "rgb(38, 201, 154)".toString();
                ctx.lineJoin = "round";
                ctx.lineCap = "round";
                ctx.lineWidth = Math.floor(5 * draw_suofang);
                ctx.stroke();
            }
        };

        handlePointerUp = (e) => {
            // 移除document上的事件监听器
            document.removeEventListener('pointermove', handlePointerMove);
            document.removeEventListener('pointerup', handlePointerUp);

            const rect = canvas.getBoundingClientRect();
            draw_end_x = (e.clientX - rect.left) * draw_suofang;
            draw_end_y = (e.clientY - rect.top) * draw_suofang;
            var startIMG = new Image();
            var endIMG = new Image();
            startIMG.src = start_sign_src;
            endIMG.src = end_sign_src;
            startIMG.onload = function () {
                ctx.drawImage(startIMG, Math.floor(draw_start_x - 15 * draw_suofang), Math.floor(draw_start_y - 22 * draw_suofang), Math.floor(30 * draw_suofang), Math.floor(30 * draw_suofang));
            }
            endIMG.onload = function () {
                ctx.drawImage(endIMG, Math.floor(draw_end_x - 15 * draw_suofang), Math.floor(draw_end_y - 22 * draw_suofang), Math.floor(30 * draw_suofang), Math.floor(30 * draw_suofang));
            }
            convasData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            drawdown = false;
            restorePointer();
        };
    }
    canvas = document.getElementById('drawpic_canvas');
    ctx = canvas.getContext('2d');
    var bgIMG = new Image();
    if (use_default_bg) {
        bgIMG.src = default_bgSRC[1];
    } else {
        // 如果是自定义背景，总是从原始的、未绘制过的背景开始绘制
        const originalBg = localStorage.getItem('userBackground_original');
        if (originalBg) {
            bgIMG.src = originalBg;
        } else {
            // Fallback to the current source if original is not found
            bgIMG.src = bgSRC;
        }
    }
    bgIMG.onload = function () {
        ctx.drawImage(bgIMG, 0, 0, current_img_width, current_img_height);
        drawdown = false;
        is_bs = false;
        convasData = null;
        canvas.addEventListener('pointerdown', handlePointerDown);
        // pointermove 和 pointerup 监听器将在 pointerdown 时动态添加到 document
    }
}

//这三个方法的具体内容, 取决于是否处在"路径变色"模式
//所以这里先占个位
var handlePointerDown, handlePointerMove, handlePointerUp;

function restorePointer() {
    // pointerdown 监听器应该保留在 canvas 上
    // canvas.removeEventListener('pointerdown', handlePointerDown); 
    // pointermove 和 pointerup 监听器已在 handlePointerUp 中从 document 移除
    document.getElementById("drawcanvas_reset_btn").className = "";
}
//取消按钮
function drawpic_hidebtn_onClick() {
    restorePointer();
    document.getElementById("body").style.overflow = "";
    document.getElementById("body").style.height = "";
    document.getElementById("drawpic_overlay").classList.remove("active");
}
//重置按钮
function drawpic_initbtn_onClick() {
    ctx.clearRect(0, 0, current_img_width, current_img_height);
    start_draw();
    document.getElementById("drawcanvas_reset_btn").className = "init-btn";
}
//确定按钮
function drawpic_yesbtn_onClick() {
    document.getElementById("body").style.overflow = "";
    document.getElementById("body").style.height = "";
    const canvasDataURL = canvas.toDataURL();
    document.getElementById("bg-img").src = canvasDataURL;
    document.getElementById("drawpic_overlay").classList.remove("active");
    // 保存绘制后的背景图片到localStorage
    localStorage.setItem('userBackground_drawn', canvasDataURL);
    use_default_bg = false;
    document.getElementById("setbgimg_reset_btn").className = "";
}
//获取当前使用的背景图片的尺寸
function getNaturalSize () {
    img = document.getElementById("bg-img")
    current_img_width = img.naturalWidth;
    current_img_height = img.naturalHeight;
}
/*----- 以上为[绘制自定义轨迹]用到的方法 -----*/

//下载截图
function Download(func=Download1) {
    let ele = document.getElementById("new-Img");
    buffer_canvas = document.getElementById("buffer_canvas");
    buffer_canvas.width = savePic_width;
    buffer_canvas.height = Math.floor(savePic_width * 2157 / 1080);
    let scale = savePic_width / document.getElementById("new-Img").getBoundingClientRect().width;
    html2canvas(ele, {
        canvas: buffer_canvas,
        useCORS: true,
        logging: false,
        height: buffer_canvas.height,
        width: buffer_canvas.width,
        scale: scale,
    }).then(func);
}
// 使用a元素
function Download1(buffer_canvas) {
    let dataurl = buffer_canvas.toDataURL('image/png');
    let donwLink = document.createElement('a');
    donwLink.Download = "keep" + (date_month) + "月" + (date_day) + "日" + "跑步打卡.png";
    donwLink.download = "keep" + (date_month) + "月" + (date_day) + "日" + "跑步打卡.png";
    donwLink.href = dataurl;
    donwLink.style = 'display: none';
    donwLink.dataset.downloadurl = ["image/png", donwLink.download, donwLink.href].join(':');
    document.body.appendChild(donwLink);
    donwLink.click();
    document.body.removeChild(donwLink);
}
// 新打开一个窗口显示图片
function Download2(buffer_canvas) {
    let dataurl = buffer_canvas.toDataURL('image/png');
    window.open('about:blank', 'image').document.write("<img src='" + dataurl + "' alt='from canvas'/>");
}
// ObjectURL
function Download3(buffer_canvas) {
    let dataurl = buffer_canvas.toDataURL('image/png');
    let picURL = URL.createObjectURL(dataURLtoBlob(dataurl));
    let donwLink = document.createElement('a');
    let fileName = "keep" + addZero(date_month) + "月" + addZero(date_day) + "日" + "跑步打卡.png";
    donwLink.Download = fileName;
    donwLink.download = fileName;
    donwLink.href = picURL;
    donwLink.style = 'display: none';
    donwLink.dataset.downloadurl = ["image/png", donwLink.download, donwLink.href].join(':');
    document.body.appendChild(donwLink);
    donwLink.click();
    document.body.removeChild(donwLink);
    URL.revokeObjectURL(picURL);
}
// window.location.href
function Download4(buffer_canvas) {
    window.location.href = buffer_canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
}

// 从API获取天气数据
function fetchWeatherData() {
    fetch('https://api.bugpk.com/api/weather?city=%E9%AB%98%E5%AF%86%E5%B8%82')
        .then(response => response.json())
        .then(data => {
            if (data && data.data) {
                humidity = parseInt(data.data.shidu.replace('%', ''));
                temperature = parseInt(data.data.wendu);
                document.getElementById("inpt_temperature").value = temperature;
                document.getElementById("inpt_humidity").value = humidity;
                rander();
            }
        })
        .catch(error => {
            console.error('获取天气数据失败:', error);
            // 如果API调用失败，使用随机生成的数据作为备用
            humidity = Math.floor(Math.random() * (90 - 30 + 1)) + 30;
            temperature = Math.floor(Math.random() * (35 - (-10) + 1)) + (-10);
        });
}

/**
 * 弹窗控制函数区域
 */

/**
 * 显示欢迎弹窗
 * 将弹窗的display样式设置为flex，使其可见
 */
function showPopup() {
    document.getElementById('welcomePopup').style.display = 'flex';
}

/**
 * 关闭欢迎弹窗
 * 隐藏弹窗并根据用户选择决定是否在localStorage中保存设置
 */
function closePopup() {
    document.getElementById('welcomePopup').style.display = 'none';
    
    // 如果勾选了"不再显示"，则将设置保存到localStorage
    if (document.getElementById('doNotShowAgain').checked) {
        localStorage.setItem('doNotShowWelcomePopup', 'true');
    }
}

/**
 * 重置弹窗设置
 * 清除localStorage中的设置并重新显示弹窗
 * @return {boolean} 返回false以阻止链接的默认行为
 */
function resetPopupSettings() {
    localStorage.removeItem('doNotShowWelcomePopup');
    showPopup();
    return false; // 阻止链接默认行为
}

/**
 * 页面加载完成后的初始化函数
 * 负责初始化所有全局变量、设置默认值、加载用户数据和显示弹窗
 */
window.onload = function() {
    // 检查是否需要显示欢迎弹窗
    if (localStorage.getItem('doNotShowWelcomePopup') !== 'true') {
        // 延迟显示弹窗，让页面先加载完成
        setTimeout(showPopup, 500);
    }
    
    // 随机生成初始运动数据
    miles = Math.floor((2 + Math.random() * 3) * 100) / 100;    // 随机生成2-5公里的里程
    speeds = Math.floor((4 + Math.random() * 6) * 100) / 100;   // 随机生成4-10的配速
    
    // 获取当前日期时间作为默认值
    let datetime_now = new Date();
    date_year = datetime_now.getFullYear();
    date_month = datetime_now.getMonth() + 1;
    date_day = datetime_now.getDate();
    time_hour = datetime_now.getHours();
    time_min = datetime_now.getMinutes();
    
    // 设置默认用户名和标题
    username = "用户名";
    keep_title = "户外跑步";
    
    // 初始设置默认值，稍后会被API数据覆盖
    humidity = 50;        // 默认湿度
    temperature = 20;     // 默认温度(℃)
    bs_prob = 0.2;        // 轨迹变色概率
    bs_range_min = 15;    // 轨迹变色范围最小值
    bs_range_max = 40;    // 轨迹变色范围最大值
    savePic_width = 1080; // 保存图片的宽度
    
    // 调用API获取天气数据
    fetchWeatherData();
    
    // 设置日期选择器的默认值为今天
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');  // 月份从0开始，需要+1
    const day = String(today.getDate()).padStart(2, '0');
    document.getElementById("inpt_date").value = `${year}-${month}-${day}`;
    
    // 设置时间选择器的默认值为当前时间
    const hours = String(time_hour).padStart(2, '0');    // 补零
    const minutes = String(time_min).padStart(2, '0');   // 补零
    document.getElementById("inpt_time").value = `${hours}:${minutes}`;

    // 初始化下拉框选项
    let bgimg_select = document.getElementById("default_bgImgSelect");
    for (let i = 0; i < bgimg_select.options.length; i ++) {
        let guijiSelect = document.getElementById(bgimg_select.options[i].value);
        for (let j = 0; j < guijiSelect.options.length; j ++) {
            guijiSelect.options[j].value = '["' + String(eval(guijiSelect.options[j].value)[0] + "?_=" + new Date().getTime()) + '", "' + String(eval(guijiSelect.options[j].value)[1] + "?_=" + new Date().getTime()) + '"]';
        }
    }
    let weather_select = document.getElementById("weather_Select");
    for (let i = 0; i < weather_select.options.length; i ++) {
        weather_select.options[i].value = weather_select.options[i].value + "?_=" + new Date().getTime();
    }
    
    // 设置默认值
    document.getElementById("inpt_username").value = username;
    document.getElementById("inpt_keep_title").value = keep_title;
    document.getElementById("inpt_miles").value = miles;
    document.getElementById("inpt_speeds").value = speeds;
    document.getElementById("inpt_temperature").value = temperature;
    document.getElementById("inpt_humidity").value = humidity;
    document.getElementById("inpt_bs_prob").value = bs_prob;
    document.getElementById("inpt_bs_range_min").value = bs_range_min;
    document.getElementById("inpt_bs_range_max").value = bs_range_max;
    // 设置保存图片宽度和默认图片
    document.getElementById("inpt_savePic_width").value = savePic_width;
    document.getElementById("gui-img").src = gui_img_src;           // 设置轨迹图片
    document.getElementById("portrait").src = default_portrait_scr;  // 设置默认头像
    
    /**
     * 从localStorage加载用户数据
     * 恢复用户上次使用的设置，包括用户名、标题和头像
     */
    // 恢复用户名
    const cachedUsername = localStorage.getItem('username');
    if (cachedUsername) {
        username = cachedUsername;
        document.getElementById("inpt_username").value = username;
    }
    
    // 恢复标题
    const cachedTitle = localStorage.getItem('keep_title');
    if (cachedTitle) {
        keep_title = cachedTitle;
        document.getElementById("inpt_keep_title").value = keep_title;
    }
    
    // 恢复自定义头像
    const cachedPortrait = localStorage.getItem('userPortrait');
    if (cachedPortrait) {
        document.getElementById("portrait").src = cachedPortrait;
        document.getElementById("setpt_reset_btn").className = "";  // 显示恢复默认按钮
    }
    
    /**
     * 设置默认背景和轨迹选择器
     * 初始化轨迹选择器并设置默认背景
     */
    if (display_guijiSelect_id) {
        document.getElementById(display_guijiSelect_id).style.display = "none";
    }
    display_guijiSelect_id = document.getElementById("default_bgImgSelect").value;
    document.getElementById(display_guijiSelect_id).style.display = "inline";
    default_bgSRC = eval(document.getElementById(display_guijiSelect_id).value);
    
    /**
     * 从localStorage加载自定义背景图片
     * 优先加载绘制过的背景，其次是原始自定义背景
     */
    const drawnBackground = localStorage.getItem('userBackground_drawn');
    const originalBackground = localStorage.getItem('userBackground_original');

    if (drawnBackground) {
        if (bgSRC) {
            URL.revokeObjectURL(bgSRC);
        }
        bgSRC = URL.createObjectURL(dataURLtoBlob(drawnBackground));
        setbgImg(bgSRC);
        use_default_bg = false;
        document.getElementById("setbgimg_reset_btn").className = "";
    } else if (originalBackground) {
        if (bgSRC) {
            URL.revokeObjectURL(bgSRC);
        }
        bgSRC = URL.createObjectURL(dataURLtoBlob(originalBackground));
        setbgImg(bgSRC);
        use_default_bg = false;
        document.getElementById("setbgimg_reset_btn").className = "";
    }
    else {
        // 如果没有自定义背景，则使用默认背景
        setbgImg(default_bgSRC[0]);
    }
    
    weather_Select_onChange();
    inpt_colorchange_checkbox_onchange();
    rander();
}