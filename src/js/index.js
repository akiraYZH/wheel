onload=function(){
    document.querySelector('.preload').classList.remove('preload');
}
    

wheel();
wonInfo();
history();

async function wheel() {
    let times = 5;
    let oChances = document.querySelector('.chances');
    let oPlate = document.querySelector('.plate');
    let oBtn = document.querySelector('.btn');
    let oPrizesUl = document.querySelector('.prizes');
    let oLinesUl = document.querySelector('.lines');
    let oPortionUl = document.querySelector('.portionUl');
    let degree = 0;
    let aPrizes = null;

    // console.log(oPrizesUl);
    aPrizes = await getPrizes().then((data) => data, (code) => {
        alert('Error code:' + code + ', Unknown error.');
        return -1;
    });
    if (aPrizes == -1) {
        return;
    }
    oChances.innerHTML = times;
    degree = 360 / aPrizes.data.prize_list.length;
    // console.log(degree);

    for (let i = 0; i < aPrizes.data.prize_list.length; i++) {
        console.log(aPrizes.data.prize_list);
        oPortionUl.innerHTML +=
            `
        <li class="color_portion" style='transform:rotate(${i*degree}deg)'>
            <div class='shape' style='transform: skewX(${90-degree}deg);'></div>
        </li>
        `;

        oLinesUl.innerHTML += `<li style='transform: translate(0, -50%) rotate(${degree*i}deg);'></li>`;

        oPrizesUl.innerHTML +=
            `
        <li>
            <p>${aPrizes.data.prize_list[i].name}</p>
            <div class="img_box">
                <img src=${aPrizes.data.prize_list[i].diagram} alt="">
            </div>
        </li>
        `
    }

    oBtn.addEventListener('click', turn);

    async function turn() {

        let prize = null;

        if (times <= 0) {
            alert('机会已用完');
            return;
        }
        oBtn.removeEventListener('click', turn);
        prize = await draw().then((data) => data, (code) => {
            alert('Error code:' + code + ', Unknown error.');
            return -1;
        });
        if (prize == -1) {
            return;
        }
        times--;
        console.log(prize);
        oPlate.style.transform = `translate(-50%, -50%) rotate(${getTurnDeg(prize.data.bingo_prize_id)}deg)`;

        oPlate.addEventListener('transitionend', showResult);



        function showResult() {
            oPlate.style.transition = 'none';
            oPlate.style.transform = `translate(-50%, -50%) rotate(${resetTurn(prize.data.bingo_prize_id)}deg)`;
            getComputedStyle(oPlate).transform;
            oPlate.style.transition = '';
            alert(`恭喜您, 您获得了${aPrizes.data.prize_list[prize.data.bingo_prize_id-1].name}`);
            oChances.innerHTML = times;
            oBtn.addEventListener('click', turn);
            oPlate.removeEventListener('transitionend', showResult);
        }
    }




    function getTurnDeg(id) {
        let turn = 3960;
        return turn - degree * (id - 1);

    }

    function resetTurn(id) {
        return -degree * (id - 1);
    }

    function getPrizes() {
        return new Promise((resolve, reject) => {
            _ajax('http://student.0melon0.cn/index/wheel/get_prize_list', '', 'GET', resolve, reject);

        });
    }

    function draw() {
        return new Promise((resolve, reject) => {
            _ajax('http://student.0melon0.cn/index/wheel/draw', 'phone=15099957262', 'GET', resolve, reject);

        });
    }

}

async function wonInfo() {
    let infoUl = document.querySelector('.won_info');
    let timer = null;
    let count = 0;
    let content = '';
    let info = await getInfo().then((data) => data, (code) => {
        alert('Failed to get won info. Error code:' + code);
        return -1;
    })

    if (info == -1) {
        return;
    }
    // infoUl.style.transition= '0.3s';
    // console.log(info);
    info.data.forEach((val, index) => {
        let reg = new RegExp('(?<=\\d{3})\\d+(?=\\d{2})');
        let blocked = val.phone.replace(reg, '***')
        content +=
            `<li>
            <i class="iconfont icon-bell"></i> 
            恭喜 ${blocked}用户抽中${val.prize_name}
        </li>`
    })
    infoUl.innerHTML = content;
    infoUl.appendChild(infoUl.children[0].cloneNode(true));
    infoUl.style.top = '0px';
    timer = setInterval(() => {
        // console.log(count);

        if (count == infoUl.children.length - 1) {
            infoUl.style.transition = '0s';
            count = 0;
            infoUl.style.top = count * (-40) + 'px';
            getComputedStyle(infoUl).transition;
            infoUl.style.transition = '';
        }
        infoUl.style.transition = '0.3s';
        getComputedStyle(infoUl).transition;
        ++count;
        infoUl.style.top = count * (-40) + 'px';
    }, 1000);

    // infoUl.addEventListener('transitionend', ()=>{

    // })
    function getInfo() {
        return new Promise((resolve, reject) => {
            _ajax('http://student.0melon0.cn/index/wheel/get_top_draw_record_list', '', 'GET', resolve, reject);
        })
    }
}

async function history() {
    let oHistoryUl = document.querySelector('.historyList');
    let content = '';
    let page = 1;
    let resizeTimer = null;
    let scrollTimer = null;
    let page_num =1;
    let pageData = null;



    await getOnePage(page,page_num);
    console.log(oHistoryUl.children[0].offsetHeight * oHistoryUl.children.length < oHistoryUl.offsetHeight);

    while (oHistoryUl.children[0].offsetHeight * oHistoryUl.children.length < oHistoryUl.offsetHeight) {
        // alert();
        await getOnePage(++page, page_num);
        if(pageData ==-1){
            break;
        }
    }


    
    window.addEventListener('resize', () => {
        if (resizeTimer == null) {
            resizeTimer = setTimeout(async () => {
                while (oHistoryUl.children[0].offsetHeight * oHistoryUl.children.length < oHistoryUl.offsetHeight) {
                    // alert();
                    await getOnePage(++page, page_num);
                }
                resizeTimer = null;
            }, 1000);
        }
    })


    oHistoryUl.addEventListener('scroll', async () => {
        if (scrollTimer == null) {
            scrollTimer = setTimeout(async () => {
                let dataHeight = oHistoryUl.children[0].offsetHeight * oHistoryUl.children.length;
                if (oHistoryUl.scrollTop + oHistoryUl.offsetHeight >= dataHeight) {
                    await getOnePage(++page, page_num);
                }
                scrollTimer =null;
            }, 200);
        }


    })

    async function getOnePage(page, page_num) {
        pageData = await getHistory(page, page_num).then((data) => data, (code) => {
            alert('Fail to get history list. Error code:' + code)
            return -1;
        });

        if (pageData == -1) {
            return;
        }
        console.log(pageData);


        pageData.data.draw_record_list.forEach((val) => {
            let date = new Date(parseInt(val.draw_time_stamp));
            // console.log(date.toDateString());

            content +=
                `<li>
                <span class="time">
                ${date.getFullYear()}.${date.getMonth()+1}.${date.getDate()} ${date.getHours()}.${date.getMinutes()}
                </span>
                <span class="name">${val.prize_name}</span>
            </li>`
        });
        oHistoryUl.innerHTML = content;
    }

    function getHistory(page, page_num) {
        return new Promise((resolve, reject) => {
            _ajax('http://student.0melon0.cn/index/wheel/get_draw_record_list', `{page='${page}',page_num=${page_num}}`, 'GET', resolve, reject);
        })
    }
}


function _ajax(_url, arg = '', method = 'GET', succFn, failFn) {
    // var domain = 'http://jianshe.bluej.cn';
    var req_url = '';
    var xhr = null;

    method == 'GET' ? req_url = _url + '?' + arg : req_url = _url;
    window.XMLHttpRequest ? xhr = new XMLHttpRequest : xhr = new ActiveXObject('Microsoft.XMLHTTP');

    xhr.open(method, req_url);
    if (method == 'GET') {
        xhr.send();
    } else {
        xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded');
        xhr.send(arg);
    }
    xhr.addEventListener('readystatechange', function () {
        if (xhr.readyState == 4) {

            xhr.status == 200 ? succFn(JSON.parse(xhr.responseText)) : failFn(xhr.status);
        }
    });
}