/*
 *    Copyright [2019] [chengjie.jlu@qq.com]
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

$('#header').load('http://localhost/header.html');
$('#sidebar').load('http://localhost/sidebar.html');
$('#footer').load('http://localhost/footer.html');

$(document).ready(function () {
    if (!document.URL.endWith("index.html")) {
        ajaxGetJson("http://localhost/api/user/tokenActive?token=" + $.cookie("token"), function (jsonResult) {
            if (jsonResult.body == null)
                window.location.href = "index.html";
            else
                initUserData(jsonResult.body);
        })
    }
    $('#create-question-form').submit(function () {
        let data = JSON.parse(parseJson($('#create-question-form')));
        data.author = currentUser;
        $('#create-question').modal('hide');
        ajaxPostJson(
            "http://localhost/api/question/create",
            JSON.stringify(data),
            function (jsonResult) {
                console.log(jsonResult);
                if (jsonResult.status === 200) {
                    window.location.href = "http://localhost/content.html?type=question&page=0&id=" + jsonResult.body.id;
                } else {
                    overhang("error", "创建问题失败，请重试。");
                }
            });
    });
});

String.prototype.endWith = function (s) {
    if (s == null || s === "" || this.length === 0 || s.length > this.length)
        return false;
    return this.substr(this.length - s.length) === s;
};

function ajaxPostJson(url, data, callback) {
    $.ajax({
        headers: {
            "token": $.cookie("token")
        },
        type: "POST",
        url: url,
        contentType: "application/json",
        dataType: "json",
        data: data,
        success: callback,
    });
}

function ajaxGetJson(url, callback) {
    $.ajax({
        headers: {
            "token": $.cookie("token")
        },
        type: "GET",
        url: url,
        dataType: "json",
        success: callback,
    });
}

function parseJson(form) {
    const formObject = {};
    const formArray = form.serializeArray();
    $.each(formArray, function (i, item) {
        formObject[item.name] = item.value;
    });
    return JSON.stringify(formObject);
}

function overhang(type, msg) {
    $("body").overhang({
        type: type,
        message: msg,
        duration: 5
    });
}

let currentUser;

function initUserData(user) {
    currentUser = user;
    $('#sidebar-avatar').attr("src", user.image);
    $('#sidebar-name').text(user.name);
    $('#sidebar-sign').text(user.sign);
    loadData();
}

(function ($) {
    $.getUrlParam = function (name, def) {
        let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        let r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return def;
    }
})(jQuery);

let currentPage = parseInt($.getUrlParam("page", "0"));

function switchTab(tab) {
    switch (tab.innerText) {
        case " 推荐":
            window.location.href = "http://localhost/home.html?tab=recommend&page=0";
            break;
        case " 问题":
            window.location.href = "http://localhost/home.html?tab=question&page=0";
            break;
        case " 想法":
            window.location.href = "http://localhost/home.html?tab=idea&page=0";
            break;
        case " 文章":
            window.location.href = "http://localhost/home.html?tab=article&page=0";
            break;
    }
}

let currentCreateAnswerBtn;
let currentEditor;

function createAnswer(e) {
    if (e === currentCreateAnswerBtn && currentEditor != null) return;
    removeEditor();
    $(e).parents('.box-body').append("<textarea id='editor'></textarea>");
    currentCreateAnswerBtn = e;
    let qid = $(e).parents('.box-solid').attr('data-question-id');
    let aid = -1;
    currentEditor = new SimpleMDE({
        element: document.getElementById("editor"),
        spellChecker: false,
        status: false,
        toolbar: ["bold", "italic", "heading", "|", "quote",
            "unordered-list", "ordered-list", "link", "image",
            "table", "|", "preview",
            {
                name: "submit",
                action: function (editor) {
                    submitAnswer(editor.value(), qid, aid);
                },
                className: "fa fa-check",
                title: "发布",
            },
            {
                name: "cancel",
                action: removeEditor,
                className: "fa fa-times",
                title: "取消",
            }],

    });
    ajaxGetJson(
        "/api/answer?qid=" + qid + "&uid=" + currentUser.id,
        function (response) {
            if (response.status === 200) {
                currentEditor.value(response.body.content + "");
                aid = response.body.id;
            }
        }
    )
}

function removeEditor() {
    if (currentEditor != null) {
        currentEditor.toTextArea();
        currentEditor = null;
    }
    $('#editor').remove();
}

function submitAnswer(content, qid, aid) {
    let request = {
        "qid": parseInt(qid),
        "author": currentUser,
        "content": content
    };
    if (aid !== -1)
        request.id = aid;
    ajaxPostJson(
        "http://localhost/api/answer/create",
        JSON.stringify(request),
        function (response) {
            window.location.href = "http://localhost/content.html?type=answer&id=" + response.body.id;
        }
    )
}

function setPage(url, size = 5) {
    pager.empty();
    pager.append("<li id='previous' onclick='previousPage()' class='paginate_button previous'><a>上一页</a></li>\n");
    ajaxGetJson(
        url,
        function (data) {
            let pages = data.body / size;
            for (let i = 0; i < pages; i = i + 1) {
                let li = "<li class=\"paginate_button ";
                if (currentPage === i)
                    li = li + "active";
                li = li + "\"><a onclick='loadPage(" + i + ")'>" + (i + 1) + "</a></li>\n";
                pager.append(li);
            }
            pager.append("<li id='next' onclick='nextPage()' class='paginate_button next'><a>下一页</a></li>\n");
            if (currentPage === 0) $('#previous').addClass("disabled");
            if (currentPage >= pages - 1) $('#next').addClass("disabled");
        }
    )
}

function previousPage() {
    if ($('#previous').hasClass("disabled")) return;
    loadPage(currentPage - 1);
}

function nextPage() {
    if ($('#next').hasClass("disabled")) return;
    loadPage(currentPage + 1);
}

function comment(url, name, form) {
    const content = $(form).find('.input-sm').val();
    if (content.length === 0) {
        overhang("error", "不能发布空的评论。");
        return;
    }
    const comment = {
        "content": content,
        "author": currentUser
    };
    ajaxPostJson(
        url + $(form).attr(name),
        JSON.stringify(comment),
        function (response) {
            if (response.status === 200)
                window.location.reload();
            else
                overhang("error", "发表评论失败，请稍后再试。");
        }
    );
}

function postMetaData(url, name, count, e, type) {
    const str = type === 'agree' ? '赞同' : '收藏';
    ajaxPostJson(
        url + $(e).attr(name),
        JSON.stringify(currentUser),
        function (response) {
            if (response.status === 200) {
                overhang("success", "已取消" + str);
                $(e).addClass('link-black');
                modifyCount(name, count, e, -1, type);
            } else {
                overhang("success", "已" + str);
                $(e).removeClass('link-black');
                modifyCount(name, count, e, 1, type);
            }
        }
    )
}

function modifyCount(name, count, e, i, type) {
    if ($(e).attr(name) === "idea") return;
    let agree = parseInt($(e).attr(count)) + i;
    $(e).attr(count, agree);
    const str = type === 'agree' ? ' 赞同 ' : ' 收藏 ';
    const cls = type === 'agree' ? " fa-thumbs-o-up'" : "fa-star-o'";
    $(e).html("<i class='fa " + cls + "></i> " + agree + str)
}

function loadMetaData(url, id, type) {
    ajaxPostJson(
        url + id,
        JSON.stringify(currentUser),
        function (response) {
            const iid = type === 'agree' ? id : 'c' + id;
            if (response.body === true) {
                $('#' + iid).removeClass('link-black');
            } else {
                $('#' + iid).addClass('link-black');
            }
        }
    )
}

function logout() {
    $.cookie("token", "");
    window.location.href = "index.html";
}