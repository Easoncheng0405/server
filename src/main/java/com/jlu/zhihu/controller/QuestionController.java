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

package com.jlu.zhihu.controller;

import com.jlu.zhihu.model.Question;
import com.jlu.zhihu.model.Response;
import com.jlu.zhihu.service.QuestionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/question")
public class QuestionController {

    private final Logger logger = LoggerFactory.getLogger(QuestionController.class);

    private final QuestionService questionService;

    @Autowired
    public QuestionController(QuestionService questionService) {
        this.questionService = questionService;
    }

    @PostMapping("/create")
    public Response<Question> create(@RequestBody Question question) {
        Response<Question> response = new Response<>();
        response.msg = "create question success.";
        response.body = questionService.createQuestion(question);
        logger.debug("create question: " + response.body);
        return response;
    }

    @GetMapping("/author/{uid}")
    public Response<List<Question>> findAllByAuthor(@PathVariable int uid) {
        Response<List<Question>> response = new Response<>();
        response.body = questionService.findAllByAuthor(uid);
        response.msg = "find " + response.body.size() + " questions.";
        return response;
    }

    @GetMapping("/{qid}")
    public Response<Question> findById(@PathVariable long qid) {
        Response<Question> response = new Response<>();
        response.body = questionService.findById(qid);
        response.msg = "request success.";
        if (response.body == null) {
            response.msg = "question not found.";
            response.status = 404;
        }
        return response;
    }

    @GetMapping("/all")
    public Response<List<Question>> all(@RequestParam int page) {
        Sort sort = new Sort(Sort.Direction.ASC, "id");
        Pageable pageable = PageRequest.of(page, 5, sort);
        Response<List<Question>> response = new Response<>();
        response.body = questionService.findAll(pageable);
        response.msg = "find " + response.body.size() + " questions.";
        return response;
    }

    @GetMapping("/count")
    public Response<Long> countAll(){
        Response<Long> response = new Response<>();
        response.body = questionService.countAll();
        response.msg = "find " + response.body + " questions.";
        return response;
    }
}
