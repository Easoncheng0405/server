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

package com.jlu.zhihu.controller.api;

import com.jlu.zhihu.model.Response;
import com.jlu.zhihu.model.User;
import com.jlu.zhihu.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Date;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/login")
    public Response<User> login(@RequestBody User user) {
        Response<User> response = new Response<>();
        response.cst = new Date().toString();
        response.status = 200;
        response.msg = "login success.";
        response.model = userService.login(user);
        return response;
    }

    @PostMapping("/register")
    public Response<User> register(@RequestBody User user) {
        Response<User> response = new Response<>();
        response.cst = new Date().toString();
        user.st = System.currentTimeMillis();
        response.status = 200;
        response.msg = "register success.";
        response.model = userService.register(user);
        return response;
    }
}