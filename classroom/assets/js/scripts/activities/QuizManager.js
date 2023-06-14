class QuizManager {

    parseQuizFieldsAndSaveThem() {
        // check empty fields
        let emptyFields = this.checkEmptyQuizFields();
        let checkBox = this.checkQuizCheckbox();
        if (emptyFields) { 
            displayNotification('error', 'newActivities.emptyFields');
            return false;
        } else if (!checkBox) {
            displayNotification('error', 'newActivities.checkBox');
            return false;
        } else {
            let tempArraySolution = []; 
            let tempArraycontentForStudent = []; 
            for (let i = 1; i < $(`textarea[id^="quiz-suggestion-"]`).length+1; i++) {
                let res = {
                    inputVal: $(`#quiz-suggestion-${i}`).bbcode(),
                    isCorrect: $(`#quiz-checkbox-${i}`).is(':checked')
                }
                let student = {
                    inputVal: $(`#quiz-suggestion-${i}`).bbcode()
                }
                tempArraySolution.push(res);
                tempArraycontentForStudent.push(student);
            }
    
            Main.getClassroomManager()._createActivity.content.quiz.contentForStudent = tempArraycontentForStudent;
            Main.getClassroomManager()._createActivity.solution = tempArraySolution;
            
            Main.getClassroomManager()._createActivity.content.hint = $('#quiz-hint').bbcode();
            Main.getClassroomManager()._createActivity.autocorrect = $('#quiz-autocorrect').is(":checked");
            
            if ($('#quiz-states').bbcode() != '') {
                Main.getClassroomManager()._createActivity.content.states = $('#quiz-states').bbcode();
            } else {
                return false;
            }
            return true;
        }
    }
    
    checkEmptyQuizFields() {
        let empty = false;
        for (let i = 1; i < $(`textarea[id^="quiz-suggestion-"]`).length+1; i++) {
            if ($(`#quiz-suggestion-${i}`).bbcode() == '') {
                empty = true;
            }
        }
        return empty;
    }
    
    // check if at least one checkbox is checked
    checkQuizCheckbox() {
        let checkboxes = $(`input[id^="quiz-checkbox-"]`);
        let checked = false;
        for (let i = 0; i < checkboxes.length; i++) {
            if (checkboxes[i].checked) {
                checked = true;
            }
        }
        return checked;
    }

    addQuizSuggestion() {
        let i = 0;
        
        do {
            i++;
        } while ($(`#quiz-suggestion-${i}`).length > 0);
    
        let divToAdd = `<div class="form-group c-primary-form" id="quiz-group-${i}">
                            <label for="quiz-suggestion-${i}" id="quiz-label-suggestion-${i}">Proposition ${i}</label>
                            <button class="btn c-btn-grey mx-2" data-i18n="newActivities.delete" id="quiz-button-suggestion-${i}" onclick="quizManager.deleteQuizSuggestion(${i})">Delete</button>
    
                            <div class="input-group mt-2 mb-3">
                                <input type="text" id="quiz-suggestion-${i}" class="form-control">
                                <div class="input-group-text c-checkbox c-checkbox-grey">
                                    <input class="form-check-input" type="checkbox" id="quiz-checkbox-${i}">
                                    <label class="form-check-label" for="quiz-checkbox-${i}" id="label-quiz-${i}" data-i18n="classroom.activities.correctAnswer">Réponse correcte</label>
                                </div>
                            </div>
                            <textarea id="quiz-suggestion-${i}" style="height:100px"></textarea>
                        </div>`;
        $('#quiz-suggestions-container').append(divToAdd);
        quizManager.enableTextArea(`#quiz-suggestion-${i}`);
        $(`#quiz-button-suggestion-${i}`).localize();
        $(`#label-quiz-${i}`).localize();
    }

    enableTextArea(id, data = null) {
        const btns = "fontcolor,underline,math,customimageupload,myimages,keys,screens";
        const optMini = Main.getClassroomManager().returnCustomConfigWysibb(btns, 100)
        $(id).wysibb(optMini);
        if (data != null) {
            $(id).forceInsertBbcode(data);
        }
    }
    
    deleteQuizSuggestion(number) {
        $(`#quiz-group-${number}`).remove();
    }

    quizValidateActivity(correction = 1, isFromCourse = false) {
        let studentResponse = [];
        for (let i = 1; i < $(`input[id^="student-quiz-checkbox-"]`).length+1; i++) {
            let res = {
                inputVal: $(`#student-quiz-suggestion-${i}`).attr("data-raw"),
                isCorrect: $(`#student-quiz-checkbox-${i}`).is(':checked')
            }
            studentResponse.push(res);
        }

        let activityId = isFromCourse ? coursesManager.actualCourse.activity : Activity.activity.id;
        let activityLink = isFromCourse ? coursesManager.actualCourse.link : Activity.id;
        
        Main.getClassroomManager().saveNewStudentActivity(activityId, correction, null, JSON.stringify(studentResponse), activityLink).then((response) => {
            if (isFromCourse) {
                coursesManager.coursesResponseManager(response, 'quiz');
            } else {
                responseManager(response, 'quiz');
            }
        });
    }

    manageUpdateForQuiz(activity) {
        let solution = JSON.parse(activity.solution),
        content = JSON.parse(activity.content);
        $('#quiz-suggestions-container').html('');
        for (let i = 1; i < solution.length+1; i++) {
            let divToAdd = `<div class="form-group c-primary-form" id="quiz-group-${i}">
                                <label for="quiz-suggestion-${i}" id="quiz-label-suggestion-${i}">Proposition ${i}</label>
                                <button class="btn c-btn-grey mx-2" data-i18n="newActivities.delete" id="quiz-button-suggestion-${i}" onclick="quizManager.deleteQuizSuggestion(${i})">Delete</button>
    
                                <div class="input-group mt-2 mb-3">
                                    <input type="text" id="quiz-suggestion-${i}" class="form-control" value="${solution[i-1].inputVal}">
                                    <span class="input-group-text c-checkbox c-checkbox-grey">
                                        <input class="form-check-input" type="checkbox" id="quiz-checkbox-${i}" ${solution[i-1].isCorrect ? "checked" : ""}>
                                        <label class="form-check-label" for="quiz-checkbox-${i}" id="label-quizz-${i}"  data-i18n="classroom.activities.correctAnswer">Réponse correcte</label>
                                    </span>
                                </div>
                                <textarea id="quiz-suggestion-${i}" style="height:100px"></textarea>
                            </div>`;

            $('#quiz-suggestions-container').append(divToAdd);
            quizManager.enableTextArea(`#quiz-suggestion-${i}`, solution[i-1].inputVal);
            $(`#quiz-button-suggestion-${i}`).localize();
            $(`#label-quizz-${i}`).localize();
        }
    
        $('#quiz-states').forceInsertBbcode(content.states);
        $('#quiz-hint').forceInsertBbcode(content.hint);
    
        if (activity.isAutocorrect) {
            $("#quiz-autocorrect").prop("checked", true);
        } else {
            $("#quiz-autocorrect").prop("checked", false);
        }
        $('#activity-quiz').show();
    
        navigatePanel('classroom-dashboard-classes-new-activity', 'dashboard-activities-teacher');
    }

    showTeacherQuizActivity(contentParsed, Activity) {
        $(`div[id^="teacher-suggestion-"]`).each(function() {
            $(this).remove();
        })
    
        let data = JSON.parse(Activity.solution);
        let htmlToPush = '';
        for (let i = 1; i < data.length+1; i++) {
            htmlToPush += `<div class="c-checkbox quiz-answer-container" id="qcm-field-${i}">
                            <input class="form-check-input" type="checkbox" id="show-quiz-checkbox-${i}" ${data[i-1].isCorrect ? 'checked' : ''} onclick="return false;">
                            <label class="form-check-label" for="quiz-checkbox-${i}" id="show-quiz-label-checkbox-${i}">${bbcodeContentIncludingMathLive(data[i-1].inputVal)}</label>
                        </div>`;
        }

        $('#activity-content').html(htmlToPush);
        quizManager.displayForShowTeacher(contentParsed);
    }

    showTeacherQuizActivityDoable(contentParsed, Activity) {
        let contentDiv = document.getElementById('activity-content');
        contentDiv.innerHTML = "";

        let divActivityDoable = document.createElement('div');
        divActivityDoable.id = "activity-doable" + Activity.id;
        divActivityDoable.classList.add("activity-doable-quiz-teacher");

        contentDiv.innerHTML = quizManager.createContentForQuiz(contentParsed.quiz.contentForStudent, true, false, true);
        quizManager.displayForShowTeacher(contentParsed);
    }

    displayForShowTeacher(contentParsed) {
        $("#activity-states").html(bbcodeContentIncludingMathLive(contentParsed.states));
        $("#activity-content-container").show();
        $("#activity-states-container").show();
    }


    manageDisplayQuiz(correction, content, correction_div, isFromCourse) {
        let course = isFromCourse ? "-course" : "";
        $('#activity-states'+course).html(bbcodeContentIncludingMathLive(content.states));
        $('#activity-states-container'+course).show();
    
        if (UserManager.getUser().isRegular) {
            $('#activity-content'+course).append(quizManager.createContentForQuiz(JSON.parse(Activity.activity.solution), false));
            $('#activity-content-container'+course).show();
        }
    
        if (correction <= 1 || correction == null) {
            if (!UserManager.getUser().isRegular) {
                $('#activity-student-response-content'+course).html("");
                if (Activity.response != null && Activity.response != '') {
                    if (JSON.parse(Activity.response) != null && JSON.parse(Activity.response) != "") {
                        $('#activity-student-response-content'+course).append(quizManager.createContentForQuiz(JSON.parse(Activity.response)));
                    }
                } else {
                    $('#activity-student-response-content'+course).append(quizManager.createContentForQuiz(content.quiz.contentForStudent));
                }
                $('#activity-student-response'+course).show();
            } else {
                quizManager.displayQuizTeacherSide(isFromCourse);
                manageCorrectionDiv(correction_div, correction, isFromCourse);
            }
        } else if (correction > 1) {
            quizManager.displayQuizTeacherSide(isFromCourse);
            manageCorrectionDiv(correction_div, correction, isFromCourse);
        }
    }

    displayQuizTeacherSide(isFromCourse) {
        let course = isFromCourse ? "-course" : "";
        if (Activity.response != null) {
            $('#activity-student-response-content'+course).html("");
            let data = "";
            if (Activity.response != null && Activity.response != "") {
                data = JSON.parse(Activity.response);
            }
            $('#activity-student-response-content'+course).append(quizManager.createContentForQuiz(data, false, true)); 
            $('#activity-student-response'+course).show();
            if (data != null && data != "") {
                Main.getClassroomManager().getActivityAutocorrectionResult(Activity.activity.id, Activity.id).then(result => {
                    for (let i = 1; i < $(`label[id^="correction-student-quiz-suggestion-"]`).length+1; i++) {
                        $('#correction-student-quiz-suggestion-' + i).parent().addClass('quiz-answer-correct');
                    }
            
                    if (result.success.length > 0) {
                        for (let i = 0; i < result.success.length; i++) {
                            $('#correction-student-quiz-suggestion-' + (result.success[i]+1)).parent().addClass('quiz-answer-incorrect');
                        }
                    }
                })
            }
        }
    }
    
    createContentForQuiz(data, doable = true, correction = false, preview = false) {
        manageLabelForActivity();
        let previewId = preview ? '-preview' : '';
        let correctionId = correction ? 'correction-' : '';
    
        let content = "";
        if (doable) {
            for (let i = 1; i < data.length+1; i++) {
                content += ` <div class="c-checkbox quiz-answer-container" id="qcm-doable-${i}${previewId}">
                                <input class="form-check-input" type="checkbox" id="student-quiz-checkbox-${i}${previewId}" ${data[i-1].isCorrect ? "checked" : ""}>
                                <label class="form-check-label" data-raw="${data[i-1].inputVal}" for="student-quiz-checkbox-${i}${previewId}" id="${correctionId}student-quiz-suggestion-${i}${previewId}">${bbcodeContentIncludingMathLive(data[i-1].inputVal)}</label>
                            </div>`;
            }
        } else {
            for (let i = 1; i < data.length+1; i++) {
                content += ` <div class="c-checkbox quiz-answer-container" id="qcm-not-doable-${i}">
                                <input class="form-check-input" type="checkbox" id="student-quiz-checkbox-${i}" ${data[i-1].isCorrect ? "checked" : ""} onclick="return false">
                                <label class="form-check-label" data-raw="${data[i-1].inputVal}" for="student-quiz-checkbox-${i}" id="${correctionId}student-quiz-suggestion-${i}">${bbcodeContentIncludingMathLive(data[i-1].inputVal)}</label>
                            </div>`;
            }
        }
        return content;
    }

    deleteQcmFields() {
        $(`div[id^="teacher-suggestion-"]`).each(function() {
            $(this).remove();
        })
    
        $(`div[id^="qcm-field-"]`).each(function() {
            $(this).remove();
        })
    
        $(`div[id^="qcm-not-doable-"]`).each(function() {
            $(this).remove();
        })
    
        $(`div[id^="qcm-doable-"]`).each(function() {
            $(this).remove();
        })
    
        $(`div[id^="quiz-group-"]`).each(function() {
            if ($(this).attr('id') != "quiz-group-1") {
                $(this).remove();
            }
        })
        $('#quiz-suggestion-1').val('');
        $('#quiz-checkbox-1').prop('checked', false);
    }

    quizPreview(activity) {
        $('#preview-activity-content').html(quizManager.createContentForQuiz(activity.content.quiz.contentForStudent, true, false, true));
        $('#preview-states').show();
        $('#preview-content').show();
        $('#activity-preview-div').show();
    }

    quizValidateActivityOnePageCourse(activityId, activityLink, correction) {
        let studentResponse = [];
        for (let i = 1; i < $(`input[id^="student-quiz-checkbox-"]`).length+1; i++) {
            let res = {
                inputVal: $(`#student-quiz-suggestion-${i}`).text(),
                isCorrect: $(`#student-quiz-checkbox-${i}`).is(':checked')
            }
            studentResponse.push(res);
        }
        
        Main.getClassroomManager().saveNewStudentActivity(activityId, correction, null, JSON.stringify(studentResponse), activityLink).then((response) => {
            quizManager.showErrors(response, activityId);
            coursesManager.displayHintForOnePageCourse(response, activityId);
            if (response.hasOwnProperty('activity')) {
                coursesManager.manageValidateReponse(response);
            }
        });
    }

    renderQuizActivity(activityData, htmlContainer, idActivity) {
        coursesManager.manageStatesAndContentForOnePageCourse(idActivity, htmlContainer, activityData);

        if (activityData.doable) {
            coursesManager.manageValidateBtnForOnePageCourse(idActivity, htmlContainer, activityData);
        }
    }

    getManageDisplayQuiz(content, activity, correction_div) {
        const activityData = {
            states: null,
            content: null,
            correction: null,
            doable: false,
            type: 'quiz',
            link: activity.id,
            id: activity.activity.id,
        }

        activityData.states = bbcodeContentIncludingMathLive(content.states);
        activityData.doable = activity.correction <= 1 || activity.correction == null;

        if (activity.correction <= 1 || activity.correction == null) {
            if (!UserManager.getUser().isRegular) {
                if (activity.activity.response != null && activity.activity.response != '') {
                    if (JSON.parse(activity.activity.response) != null && JSON.parse(activity.activity.response) != "") {
                        activityData.content = quizManager.createContentForQuiz(JSON.parse(activity.activity.response));
                    }
                } else {
                    activityData.content = quizManager.createContentForQuiz(content.quiz.contentForStudent);
                }
            }
        } else if (activity.correction > 1) {
            activityData.content = quizManager.returnCorrectedContent(activity);
        }

        return activityData;
    }

    returnCorrectedContent(activity) {
        if (activity.response != null) {
            let data = "";
            if (activity.response != null && activity.response != "") {
                data = JSON.parse(activity.response);
            }
            const solution = JSON.parse(activity.activity.solution);

            let dataCorrected = "";
            for (let i = 1; i < data.length+1; i++) {
                
                let correctAnswer = false;
                if (data[i-1].isCorrect == solution[i-1].isCorrect) {
                    correctAnswer = true;
                }

                dataCorrected += ` <div class="c-checkbox quiz-answer-container ${correctAnswer ? "quiz-answer-correct" : "quiz-answer-incorrect"}" id="qcm-not-doable-${i}">
                                <input class="form-check-input" type="checkbox" id="student-quiz-checkbox-${i}" ${data[i-1].isCorrect ? "checked" : ""} onclick="return false">
                                <label class="form-check-label" for="student-quiz-checkbox-${i}" id="correction-student-quiz-suggestion-${i}">${data[i-1].inputVal}</label>
                            </div>`;
            }
            return dataCorrected;
        }
    }

    showErrors(response) {
        if (!response.hasOwnProperty('badResponse')) {
            return;
        }
        displayNotification('#notif-div', "classroom.activities.wrongAnswerLarge", "error");
        document.querySelectorAll('.quiz-answer-incorrect').forEach((element) => {
            element.classList.remove('quiz-answer-incorrect');
        });

        for (let i = 1; i < $(`input[id^="student-quiz-suggestion-"]`).length+1; i++) {
            $('#student-quiz-suggestion-' + i).parent().addClass('quiz-answer-correct');
        }

        for (let i = 0; i < response.badResponse.length; i++) {
            $('#student-quiz-suggestion-' + (response.badResponse[i]+1)).parent().addClass('quiz-answer-incorrect');
        }
    }
}

const quizManager = new QuizManager();

