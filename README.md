# multistepdependentquiz
Generate multi step dependent quiz from json structure

<a target="_blank" href="https://shardiwal.github.io/multistepdependentquiz/"> DEMO </a>

HTML snippet
~~~~
<div class="progress">
    <div class="progress-bar progress-bar-striped active" role="progressbar" aria-valuemin="0" aria-valuemax="100"></div>
</div>
<form method="post" enctype="multipart/form-data" name="test">
<div id="wizard_questions" data-quiz="" class="hello"></div>
<div class="q_container" id="final_step" style="display:none;">
    <div class="qu">You have told us</div>
    <div class="options">
        <div class="opt"><textarea rows="10" cols="50" name="final_step" readonly="true"></textarea></div>
    </div>
</div>
<button class="back btn btn-primary">Back</button>
<button class="next btn btn-primary">Next</button>
<button class="submit btn btn-primary">Finish & Submit</button>
</form>
~~~~
JS snippet
~~~~
$('#wizard_questions').multiStepQuiz({
    'quiz_data' : json_data,
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
    'nextCallback' : function( current_step, steps_limit, response, jobcode ) {
        if(current_step > 1){
            $('p.intro').hide();
        }
        if ( current_step == steps_limit ) {
            var data_as_string = response.join('\n');
            $('textarea[name="final_step"]').val( data_as_string );
            $('#final_step').show();
            console.log( jobcode );
        }
    },
    'backCallback' : function( current_step, steps_limit, response, jobcode ) {
        if(current_step < 2){
            $('p.intro').show();
        }
    },
    'submitCallback' : function( event, current_step, steps_limit, response, jobcode ) {
        event.preventDefault();
        alert('Thank you.');
    }
});
~~~~ 
JSON snippet
~~~~
[
  {
    "question": "Is this an emergency?",
    "type": "radio",      // Quiz type - allowed radio, text, file, hidden
    "question_code":"Q1", // Quiz Code
    "options":[
      {
        "code":"Q1OP1",
        "steps":4,
        "text":"My issue requires immediate onsite assistance",
        "child":["Q2"]
      },
      {
        "code":"Q1OP2",  // Option Code
        "steps":4,       // No of step on this option selection
        "text":"No I do not require immediate assistance",
        "child":["Q3"]   // Child Questions Codes
      }
    ]
  }
]
~~~~
