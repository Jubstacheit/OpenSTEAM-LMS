class DragAndDropManager {
    
    init() {
        $('#dragAndDrop-add-inputs').click(() => {
            if ($("#drag-and-drop-content").getSelectText() != "") {
                $('#drag-and-drop-content').bbcode();
                let randomString = Math.random().toString(36).substring(7);
                replaceSelectionWithHtml(`<span class="lms-answer" data-id="${randomString}">${$("#drag-and-drop-content").getSelectText()}</span>\&nbsp`);
                let newText = $('#drag-and-drop-content').htmlcode();
                $('#drag-and-drop-content').htmlcode(newText);
                setCaret('drag-and-drop-content', randomString);
            } else {
                $('#drag-and-drop-content').bbcode()
                $('#drag-and-drop-content').htmlcode($('#drag-and-drop-content').htmlcode() + `\&nbsp;<span class="lms-answer">\&nbsp;réponse\&nbsp;</span>\&nbsp;`);
            }
        });
    }

    parseDragAndDropFieldsAndSaveThem() {

        if ($('#drag-and-drop-content').bbcode().match(/\[answer\](.*?)\[\/answer\]/gi) == null) {
            displayNotification('#notif-div', "classroom.notif.noAnswerInActivity", "error");
            return false;
        }
        
        Main.getClassroomManager()._createActivity.content.dragAndDropFields.contentForTeacher = $('#drag-and-drop-content').bbcode();
        
        let responseDD = $('#drag-and-drop-content').bbcode().match(/\[answer\](.*?)\[\/answer\]/gi).map(match => match.replace(/\[answer\](.*?)\[\/answer\]/gi, "$1"));
        
        responseDD.forEach((e, i) => {
            responseDD[i] = e.trim();
            if (e.includes('&&')) {
                responseDD[i] = e.split('&&').map(e => e.trim()).join(',');
            }
        })
    
        if ($('#drag-and-drop-states').bbcode() != '') {
            Main.getClassroomManager()._createActivity.content.states = $('#drag-and-drop-states').bbcode();
        } else {
            return false;
        }
    
        Main.getClassroomManager()._createActivity.autocorrect = $('#drag-and-drop-autocorrect').is(":checked");
        Main.getClassroomManager()._createActivity.content.hint = $('#drag-and-drop-hint').bbcode();
    
    
        Main.getClassroomManager()._createActivity.solution = responseDD;
    
        if (Main.getClassroomManager()._createActivity.content.dragAndDropFields.contentForTeacher == "") {
            return false;
        }
        return true;
    }

    dragAndDropValidateActivity(correction = 1, isFromCourse = false) {
        let studentResponse = [];
        for (let i = 0; i < $(`span[id^="dz-"]`).length; i++) {
            let string = document.getElementById(`dz-${i}`).children.length > 0 ? document.getElementById(`dz-${i}`).children[0].innerHTML : "";
            studentResponse.push({
                string: string
            });
        }

        let activityId = isFromCourse ? coursesManager.actualCourse.activity : Activity.activity.id,
            activityLink = isFromCourse ? coursesManager.actualCourse.link : Activity.id;

        Main.getClassroomManager().saveNewStudentActivity(activityId, correction, null, JSON.stringify(studentResponse), activityLink).then((response) => {
            if (isFromCourse) {
                coursesManager.coursesResponseManager(response, 'drag-and-drop');
            } else {
                responseManager(response, 'drag-and-drop');
            }
        });
    }

    manageUpdateForDragAndDrop(activity) {
        $('#activity-drag-and-drop').show();
        let content = JSON.parse(activity.content);
        $("#drag-and-drop-hint").forceInsertBbcode(content.hint);
        $("#drag-and-drop-states").forceInsertBbcode(content.states);
        $("#drag-and-drop-content").forceInsertBbcode(content.dragAndDropFields.contentForTeacher);
        activity.isAutocorrect ? $("#drag-and-drop-autocorrect").prop("checked", true) : $("#drag-and-drop-autocorrect").prop("checked", false);
        navigatePanel('classroom-dashboard-classes-new-activity', 'dashboard-activities-teacher');
    }

    showTeacherDragAndDropActivity(contentParsed, Activity) {
        $("#activity-states").html(bbcodeContentIncludingMathLive(contentParsed.states));
        let contentForTeacher = contentParsed.dragAndDropFields.contentForTeacher;
        contentForTeacher = parseContent(contentForTeacher, "drag-and-drop-answer-teacher", true);
        $("#activity-content").html(bbcodeContentIncludingMathLive(contentForTeacher));
        $("#activity-content-container").show();
        $("#activity-states-container").show();
    }

    showTeacherDragAndDropActivityDoable(contentParsed, Activity) {

        let solution = JSON.parse(Activity.solution);
        let contentDiv = document.getElementById('activity-content');
        contentDiv.innerHTML = "";

        let ContentString = manageDragAndDropText(contentParsed.dragAndDropFields.contentForTeacher, true, solution);

        let divActivityDoable = document.createElement('div');
        divActivityDoable.id = "activity-doable" + Activity.id;

        $('#preview-drag-and-drop-text').html(`<div>${bbcodeContentIncludingMathLive(ContentString)}</div>`);
        divActivityDoable.classList.add("activity-doable-drag-and-drop-teacher");

        let divContent = document.createElement('div');
        divContent.innerHTML = bbcodeContentIncludingMathLive(ContentString);
        divActivityDoable.appendChild(divContent);

        let divPreviewFields = document.createElement('div');
        divPreviewFields.id = "preview-drag-and-drop-fields-teacher";
        divPreviewFields.classList.add("m-2");
        divPreviewFields.classList.add("drag-and-drop-fields");


        divActivityDoable.appendChild(divPreviewFields);
        contentDiv.appendChild(divActivityDoable);



        solution.forEach(e => {
            $('#preview-drag-and-drop-fields-teacher').append(`<p class="draggable draggable-items drag-drop" id="${e}">${e.trim()}</p>`);
        });



        initializeDragulaWithOneContainer('preview-drag-and-drop-fields-teacher', 'dropzone-preview');
        $('#preview-states').show();
        $('#preview-activity-drag-and-drop-container').show();
        $('#activity-preview-div').show();

    }

    manageDisplayDragAndDrop(correction, content, correction_div, isFromCourse) {
        let course = isFromCourse ? "-course" : "";
        $('#activity-title'+course).html(Activity.activity.title);
        // Show the content with the response to the teacher
        if (UserManager.getUser().isRegular) {
    
            let contentForTeacher = content.dragAndDropFields.contentForTeacher;
            contentForTeacher = parseContent(contentForTeacher, "drag-and-drop-answer-teacher", true);
            $('#activity-content'+course).html(bbcodeContentIncludingMathLive(contentForTeacher));
            $('#activity-content-container'+course).show();
        }
    
        $('#activity-states'+course).html(bbcodeContentIncludingMathLive(content.states));
        $('#activity-states-container'+course).show();
        
        if (correction <= 1 || correction == null) {
            if (!UserManager.getUser().isRegular) {
    
                let ContentString = manageDragAndDropText(content.dragAndDropFields.contentForTeacher);
                $('#drag-and-drop-text'+course).html(`<div>${ContentString}</div>`);
    
                // Get the response array and shuffle it
                let choices = shuffleArray(JSON.parse(Activity.activity.solution));
    
                choices.forEach(e => {
                    $('#drag-and-drop-fields'+course).append(`<p class="draggable draggable-items drag-drop" id="${e}">${e.trim()}</p>`);
                });
                $('#activity-drag-and-drop-container'+course).show();
            
                initializeDragulaWithOneContainer('drag-and-drop-fields'+course, 'dropzone');
    
                // Place the student's response if there is one
                if (Activity.response != null && Activity.response != "") {
                    let response = JSON.parse(Activity.response);
                    response.forEach((e, i) => {
                        if (bbcodeToHtml(e.string) != e.string) {
                            $(`#dz-${i}`).html(document.getElementById(e.string));
                        } else {
                            if (e.string.toLowerCase() != "" && e.string.toLowerCase() != null) {
                                let contentById = document.getElementById(e.string.toLowerCase());
                                if (contentById != null) {
                                    $(`#dz-${i}`).html(contentById);
                                }
                            }
                        }
                    })
                }
            } else {
                dragAndDropManager.displayDragAndDropTeacherSide(correction_div, correction, content, isFromCourse);
            }
        } else if (correction > 1) {
            dragAndDropManager.displayDragAndDropTeacherSide(correction_div, correction, content, isFromCourse);
        } 
    }
    
    displayDragAndDropTeacherSide(correction_div, correction, content, isFromCourse) {
        let course = isFromCourse ? "-course" : "";
        let studentResponses = JSON.parse(Activity.response);
        let studentContentString = content.dragAndDropFields.contentForTeacher;
    
        $(`input[id^="corrected-student-response-"]`).each((i, e) => {
            $(e).remove();
        })
    
        if (studentResponses != "" && studentResponses != null) {
            for (let i = 0; i < studentResponses.length; i++) {
                let autoWidthStyle = 'style="width:' + (studentResponses[i].string.toLowerCase().length + 2) + 'ch"';
                let answer = studentContentString.match(/\[answer\](.*?)\[\/answer\]/g)[0];
                let mathContent = parseMathLiveContent(studentResponses[i].string);

                if (mathContent) {
                    studentContentString = studentContentString.replace(answer, `<div class='drag-and-drop-answer-teacher' id="corrected-student-response-${i}">${mathContent}</div>`);
                } else if (bbcodeToHtml(studentResponses[i].string) != studentResponses[i].string) {
                    studentContentString = studentContentString.replace(answer, bbcodeToHtml(studentResponses[i].string));
                } else {
                    studentContentString = studentContentString.replace(answer, `<input readonly class='drag-and-drop-answer-teacher' id="corrected-student-response-${i}" value="${studentResponses[i].string.toLowerCase()}" ${autoWidthStyle}>`);
                }
            }
        
            $('#activity-student-response-content'+course).html(bbcodeContentIncludingMathLive(studentContentString));
            $('#activity-student-response'+course).show();
            Main.getClassroomManager().getActivityAutocorrectionResult(Activity.activity.id, Activity.id).then(result => {
                for (let i = 0; i < $(`[id^="corrected-student-response-"]`).length; i++) {
                    document.getElementById('corrected-student-response-' + i).classList.add("answer-correct");
                }
            
                for (let i = 0; i < result.success.length; i++) {
                    document.getElementById('corrected-student-response-' + (result.success[i])).classList.add("answer-correct");
                }
            })
        }
        manageCorrectionDiv(correction_div, correction, isFromCourse);
    }

    dragAndDropPreview(activity) {
        let ContentString = manageDragAndDropText(activity.content.dragAndDropFields.contentForTeacher, true);
        $('#preview-drag-and-drop-text').html(`<div>${bbcodeContentIncludingMathLive(ContentString)}</div>`);

        // Get the response array and shuffle it
        let choices = shuffleArray(activity.solution);
        choices.forEach(e => {
            $('#preview-drag-and-drop-fields').append(`<p class="draggable draggable-items drag-drop" id="${e}">${e.trim()}</p>`);
        });
    

        initializeDragulaWithOneContainer('preview-drag-and-drop-fields', 'dropzone-preview');
        $('#preview-states').show();
        $('#preview-activity-drag-and-drop-container').show();
        $('#activity-preview-div').show();
    }

    dragAndDropValidateActivityOnePageCourse(activityId, activityLink) {
        let studentResponse = [];

        for (let i = 0; i < $(`span[id^="dz-"]`).length; i++) {
            let string = document.getElementById(`dz-${i}`).children.length > 0 ? document.getElementById(`dz-${i}`).children[0].innerHTML : "";
            studentResponse.push({
                string: string
            });
        }

        Main.getClassroomManager().saveNewStudentActivity(activityId, 1, null, JSON.stringify(studentResponse), activityLink).then((response) => {
            dragAndDropManager.showErrors(response, activityId);
            coursesManager.displayHintForOnePageCourse(response, activityId);
            if (response.hasOwnProperty('activity')) {
                coursesManager.manageValidateReponse(response);
            }
        });
    }

    renderDragAndDropActivity(activityData, htmlContainer, idActivity, responses) {
        coursesManager.manageStatesAndContentForOnePageCourse(idActivity, htmlContainer, activityData);

        if (activityData.doable) {
            const dragAndDropFieldsDiv = document.createElement('div');
            dragAndDropFieldsDiv.classList.add('drag-and-drop-fields');
            dragAndDropFieldsDiv.id = 'drag-and-drop-fields-one-page-course' + idActivity;
            dragAndDropFieldsDiv.innerHTML = activityData.dragAndDropChoices;
            htmlContainer.appendChild(dragAndDropFieldsDiv);
            
            initializeDragulaWithOneContainer('drag-and-drop-fields-one-page-course' + idActivity, 'dropzone');
    
            if (responses != null && responses != "") {
                let response = JSON.parse(responses);
                response.forEach((e, i) => {
                    if (bbcodeToHtml(e.string) != e.string) {
                        $(`#dz-${i}`).html(document.getElementById(e.string));
                    } else {
                        if (e.string.toLowerCase() != "" && e.string.toLowerCase() != null) {
                            let contentById = document.getElementById(e.string.toLowerCase());
                            if (contentById != null) {
                                $(`#dz-${i}`).html(contentById);
                            }
                        }
                    }
                })
            }
    
            coursesManager.manageValidateBtnForOnePageCourse(idActivity, htmlContainer, activityData);
        }
    }

    getManageDisplayDragAndDrop(content, activity, correction_div) {
        const activityData = {
            states: null,
            content: null,
            correction: null,
            doable: false,
            dragAndDropChoices: null,
            type: "dragAndDrop",
            link: activity.id,
            id: activity.activity.id,
        }

        activityData.states = bbcodeContentIncludingMathLive(content.states);
        activityData.doable = activity.correction <= 1 || activity.correction == null;

        if (activity.correction <= 1 || activity.correction == null) {
            if (!UserManager.getUser().isRegular) {
                let ContentString = manageDragAndDropText(content.dragAndDropFields.contentForTeacher, false, JSON.parse(activity.activity.solution));
                activityData.content = `<div>${ContentString}</div>`;
    
                // Get the response array and shuffle it
                let choices = shuffleArray(JSON.parse(activity.activity.solution));
                choices.forEach(e => {
                    if (activityData.dragAndDropChoices != null) {
                        activityData.dragAndDropChoices += `<p class="draggable draggable-items drag-drop" id="${e}">${e.trim()}</p>`;
                    } else {
                        activityData.dragAndDropChoices = `<p class="draggable draggable-items drag-drop" id="${e}">${e.trim()}</p>`;
                    }
                });
            }
        } else if (activity.correction > 1) {
            //dragAndDropManager.displayDragAndDropTeacherSide(correction_div, activity.activity.correction, content, isFromCourse);
            activityData.content = dragAndDropManager.returnCorrectedContent(activity, content);
        } 

        return activityData;
    }

    returnCorrectedContent(activity, content) {
        let studentResponses = JSON.parse(activity.response);
        let studentContentString = content.dragAndDropFields.contentForTeacher;
        let solution = JSON.parse(activity.activity.solution);
        let correctedContent = "";

    
        if (studentResponses != "" && studentResponses != null) {
            for (let i = 0; i < studentResponses.length; i++) {
                let autoWidthStyle = 'style="width:' + (studentResponses[i].string.toLowerCase().length + 2) + 'ch"';
                let answer = studentContentString.match(/\[answer\](.*?)\[\/answer\]/g)[0];
                let mathContent = parseMathLiveContent(studentResponses[i].string);

                let correctAnswer = false;
                if (studentResponses[i].string == solution[i]) {
                    correctAnswer = true;
                }

                if (mathContent) {
                    studentContentString = studentContentString.replace(answer, `<div class='drag-and-drop-answer-teacher' id="corrected-student-response-${i}">${mathContent}</div>`);
                } else if (bbcodeToHtml(studentResponses[i].string) != studentResponses[i].string) {
                    studentContentString = studentContentString.replace(answer, bbcodeToHtml(studentResponses[i].string));
                } else {
                    studentContentString = studentContentString.replace(answer, `<input readonly class='drag-and-drop-answer-teacher ${correctAnswer ? "answer-correct" : ""}' id="corrected-student-response-${i}" value="${studentResponses[i].string.toLowerCase()}" ${autoWidthStyle}>`);
                }
            }
            
            correctedContent = bbcodeContentIncludingMathLive(studentContentString);
        }

        return correctedContent;
    }

    showErrors(response) {
        if (!response.hasOwnProperty('badResponse')) {
            return;
        }
        displayNotification('#notif-div', "classroom.activities.wrongAnswerLarge", "error");
        for (let i = 0; i < $(`span[id^="dz-"]`).length; i++) {
            $('#dz-' + i).css("border","1px solid var(--correction-3)");
        }

        for (let i = 0; i < response.badResponse.length; i++) {
            $('#dz-' + (response.badResponse[i])).css("border","1px solid var(--correction-0)");
        }
    }
}

const dragAndDropManager = new DragAndDropManager();
dragAndDropManager.init();

