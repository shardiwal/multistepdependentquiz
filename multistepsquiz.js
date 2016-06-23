/**
    Author: Rakesh Kumar Shardiwal
    Email: rakesh.shardiwal@gmail.com
**/
/**
    Its a multi step quiz generator, generation is based on json data your provided
**/
/**
    Example of quiz json data
[
{
    "question": "Is this an emergency?",
    "type": "radio",
    "options": [{
        "code": "Q1OP1",
        "steps": 4,
        "text": "My issue requires immediate onsite assistance",
        "child": ["Q2"]
    }, {
        "child": ["Q3"],
        "text": "No I do not require immediate assistance",
        "code": "Q1OP2",
        "steps": 4
    }],
    "required": "true",
    "question_code": "Q1"
},
{
    "options": [],
    "type": "text",
    "question": "Ok, give us a description of the issue",
    "question_code": "Q4"
},
{
    "type": "file",
    "options": [],
    "question_code": "Q11",
    "question": "Attach the payment reciepts"
},
{
    "question_code": "Q22-jobcode",
    "options": [],
    "type": "hidden",
    "value": "Plumbing Issue"
}
]
**/
(function ( $ ) {
    $.fn.multiStepQuiz = function(options) {

        var $self     = $(this);
        var quiz_data = $self.data('quiz');
        var settings  = $.extend({
            'quiz_data': quiz_data,
            'question_conatiner': 'q_container',
            'option_container': 'options',
            'option_class': 'opt',
            'question_class': 'qu',
            'option_input_class': 'input',
            'steps_limit': 6,
            'current_step': 1,
            'btnnext': $(".next"),
            'btnback': $(".back"), 
            'btnsubmit': $(".submit"),
            'progressbar': $(".progress-bar"),
        }, options );

        if ( !settings.quiz_data ) {
            throw 'Not quiz data specified';
        }

        if ( typeof(settings.quiz_data) == 'object'){
            $self.quiz_data_object = settings.quiz_data;
        }
        else {
            $self.quiz_data_object = jQuery.parseJSON( settings.quiz_data );
        }

        getQuestion = function(code) {
            var qu;
            $.each($self.quiz_data_object, function(i,e){
                if ( e.question_code == code) {
                    qu = e;
                }
            });
            return qu;
        };

        radioTypeField = function(e, name_attr, $container) {
            var $option  = $('<div/>',{ 'class':settings.option_container });
            $.each(e.options, function(i,op){
                var child_ids = op.child ? op.child.join(',') : '';
                $('<div/>', { 'class':settings.option_class} ).append(
                    $('<label/>').html( op.text ).prepend(
                        $('<input/>',{
                            'name': name_attr,
                            'type': 'radio',
                            'class': settings.option_input_class,
                            'data-code' : op.code,
                            'data-child': child_ids,
                            'value': op.text,
                            'data-steps': op.steps
                        })
                    )
                ).appendTo($option);
            });
            $container.append( $option );
        };

        fileTypeField = function(e, name_attr, $container) {
            var $option  = $('<div/>',{ 'class':settings.option_container });
            $('<div/>', { 'class':settings.option_class} ).append(
                $('<input/>',{
                    'type': 'file',
                    'name': name_attr,
                    'class': settings.option_input_class,
                    'data-code' : e.question_code
                } )
            ).appendTo($option);
            $container.append( $option );
        };

        textTypeField = function(e, name_attr, $container) {
            var $option  = $('<div/>',{ 'class':settings.option_container });
            $('<div/>', { 'class':settings.option_class} ).append(
                $('<textarea/>',{
                    'rows': '2',
                    'cols': '50',
                    'name': name_attr,
                    'class': settings.option_input_class,
                    'data-code' : e.question_code
                } )
            ).appendTo($option);
            $container.append( $option );
        };

        hiddenTypeField = function(e, name_attr, $container) {
            var $option  = $('<div/>',{ 'class':settings.option_container });
            $('<div/>', { 'class':settings.option_class} ).append(
                $('<input/>',{
                    'type': 'hidden',
                    'value': e.value,
                    'name': name_attr,
                    'class': settings.option_input_class,
                } )
            ).appendTo($option);
            $container.append( $option );
        };

        drawChilds = function(op, $container) {
            if ( !op.child ) { return false; }

            $.each(op.child, function(i,e){
                var que       = getQuestion(e);
                var name_attr = op.code + que.question_code;
                var $question_container = $('<div/>',{ 'id': op.code + que.question_code, 'class':settings.question_conatiner, 'data-code':que.question_code });

                if ( que.question ) {
                    var $question = $('<div/>',{ 'class':settings.question_class, 'data-code':que.question_code }).html(que.question);
                    $question_container.append( $question );
                }

                $question_container.hide();

                if ( que.type == 'radio' ) {
                    radioTypeField(que, name_attr, $question_container);
                }
                if ( que.type == 'text' ) {
                    textTypeField(que, name_attr, $question_container);
                }
                if ( que.type == 'file' ) {
                    fileTypeField(que, name_attr, $question_container);
                }
                if ( que.type == 'hidden' ) {
                    hiddenTypeField(que, name_attr, $question_container);
                }
                
                $container.append( $question_container );
            });

        };

        // Change progress bar action
        setProgress = function(currstep){
            var percent = parseFloat(100 / settings.steps_limit) * currstep;
            percent = percent.toFixed();
            settings.progressbar.css("width",percent+"%").html(percent+"%");      
        };

        // Hide buttons according to the current step
        hideButtons = function(current_step){
            settings.btnsubmit.hide();
            settings.btnback.hide();
            if(current_step < settings.steps_limit) settings.btnnext.show();
            if(current_step > 1) settings.btnback.show();
            if(current_step == settings.steps_limit) { settings.btnnext.hide(); settings.btnsubmit.show(); }
        };

        submittedResponse = function(){
            var submited_response = Array();
            var jobcode = '';
            $.each( response, function(i,d) {
                $.each( d, function(i,dd ) {
                    if ( !dd.name.match(/jobcode$/) ) {
                        submited_response.push( dd.value );
                    }
                    else {
                        jobcode = dd.value;
                    }
                });
            } );
            return Array(submited_response, jobcode);
        };

        var sequence = {};
        response = {};

        // traverse all nodes
        this.each(function() {

            // express a single node as a jQuery object
            var $t = $(this);
            var first_question_id = '';
            $.each( $self.quiz_data_object, function(i,e){

                var $question_container = $('<div/>',{ 'id': e.question_code, 'class':settings.question_conatiner, 'data-code':e.question_code });
                var $question = $('<div/>',{ 'class':settings.question_class, 'data-code':e.question_code }).html(e.question);

                $question_container.append( $question );
                if ( i >= 1 ) {
                    return true;
                }
                if ( e.type == 'radio' ) {
                    radioTypeField(e, e.question_code, $question_container);
                    first_question_id = e.question_code;
                }
                $t.append( $question_container );
            });

            $.each( $self.quiz_data_object, function(i,e){
                $.each(e.options, function(i,o){
                    drawChilds(o, $t);
                });
            });

            hideButtons(settings.current_step);
            setProgress(settings.current_step);

            response[settings.current_step] = Array();
            sequence[settings.current_step] = Array();
            sequence[settings.current_step].push('#'+first_question_id);
            response[settings.current_step].push('#'+first_question_id);

            // Next button click action
            settings.btnnext.click(function(e){
                e.preventDefault();
                var current_step = settings.current_step;
                var steps_limit  = settings.steps_limit;

                if(current_step < steps_limit){
                    var $selected_radio = $('.'+ settings.question_conatiner +':visible input[type=radio]:checked');

                    if ( $('.'+ settings.question_conatiner +':visible input[type=radio]').length ) {
                        if ( !$selected_radio.length ){
                            alert( 'Please select your choice' );
                            return;
                        }
                    }

                    response[current_step] = Array();
                    response[current_step] = $t.find('.'+ settings.question_conatiner +':visible input, .'+ settings.question_conatiner +':visible textarea').serializeArray();

                    var childs = $selected_radio.data('child');
                    var opcode = $selected_radio.data('code');
                    var steps  = $selected_radio.data('steps');
                    if ( steps ) {
                        settings.steps_limit = steps;
                    }

                    $('.'+ settings.question_conatiner).hide();
                    current_step++;
                    settings.current_step = current_step;

                    if ( childs ) {
                        sequence[current_step] = Array();
                        $.each( childs.split(','), function(i,e){
                            currentQ = '#'+opcode+e;
                            $current_q = $(currentQ);
                            $current_q.show();
                            sequence[current_step].push( currentQ );
                        } );
                    }

                    setProgress(current_step);

                    if ( typeof(settings.nextCallback) == 'function' ) {
                        var sumres = submittedResponse();
                        settings.nextCallback(
                            settings.current_step, settings.steps_limit, sumres[0], sumres[1]
                        );
                    }
                }
                hideButtons(current_step);
            });

            // Back button click action
            settings.btnback.click(function(e){
                e.preventDefault();
                var current_step = settings.current_step;
                var steps_limit  = settings.steps_limit;

                if(current_step > 1){

                    current_step = current_step - 1;
                    settings.current_step = current_step;

                    shown_ids = Array();
                    $.each( sequence[current_step], function(i,ve){
                        shown_ids.push( ve );
                    });
                    shown_ids_as_string = shown_ids.join(',');

                    $current_q = $(shown_ids_as_string);
                    $current_q.show();

                    $('.'+ settings.question_conatiner).not($current_q).hide();
                    setProgress(current_step);
                }

                hideButtons(settings.current_step);
                if ( typeof(settings.backCallback) == 'function' ) {
                    var sumres = submittedResponse();
                    settings.backCallback(
                        settings.current_step, settings.steps_limit, sumres[0], sumres[1]
                    );
                }
            });

            // Submit button click action
            settings.btnsubmit.click(function(e){
                if ( typeof(settings.submitCallback) == 'function' ) {
                    var sumres = submittedResponse();
                    settings.submitCallback(
                        e, settings.current_step, settings.steps_limit, sumres[0], sumres[1]
                    );
                }
            });

        });

    };

}( jQuery ));