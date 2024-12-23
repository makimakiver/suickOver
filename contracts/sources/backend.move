/*
/// Module: suickoverflow
module suickoverflow::suickoverflow;
*/

module 0x0::suickoverflow{

    use std::string::{String};
    use sui::sui::SUI;
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};
    use sui::clock::{Self, Clock};
    use sui::dynamic_object_field as dof;
    use sui::borrow::{Self};
    // use sui::test_utils;
    //use sui::dynamic_field as df;
    
    // use sui::clock::Clock;
    // use sui::transfer;
    
    public struct AdminUser has key{id: UID}

    public struct QuestionToEarn has key, store{
        id: UID,
        price: u64,
        balance: Balance<SUI>
    }

    // public struct Users has key, store{
    //     id: UID,
    //     users: u64,
    // }

    public struct Question has key, store{
        id: UID,
        title: String,
        description: String,
        user: address,
        price: u64,
        question_to_earn: QuestionToEarn,
        expiring_date: u64,
        answers: vector<address>
    }

    // public struct Questions has key, store{
    //     id: UID,
    //     questions: u64,
    // }
    // public struct AIUser has key, store{
    //     id: UID,
    //     name: String,
    //     // I just added description and not sure whether I'll keep it or not.
    //     description: String,
    //     // we are still not sure about whether we should have a balance here or not.
    //     humanity: bool
    // }

    public struct Answer has key, store{
        id: UID,
        // question: Question,
        question_address: address,  // we don't need to store the question object as it might take up a lot of space.
        answer: String,
        user: address,
        likes: u64
    }

    // public struct Answers has key, store{
    //     id: UID,
    //     answers: u64,
    // }
    public struct User has key, store{
        id: UID,
        name: String,
        description: String,
        address: address,
        like_history: vector<address>,
        // we are still not sure about whether we should have a balance here or not.
        // balance: Balance<SUI>
    }

    // fun init(ctx: &mut TxContext){
    //     transfer::share_object(
    //     Users {
    //             id: object::new(ctx),
    //             users: 0
    //         }
    //     );
    //     transfer::share_object(
    //         Questions {
    //             id: object::new(ctx),
    //             questions: 0
    //         }
    //     );
    //     transfer::share_object(
    //         Answers {
    //             id: object::new(ctx),
    //             answers: 0
    //         }
    //     );
    // }
    // public fun create_User_Account(users: &mut Users, name: String, desc: String, ctx: &mut TxContext){
    
    public entry fun create_User_Account(name: String, desc: String, ctx: &mut TxContext){
        let user = User {
            id: object::new(ctx),
            address: ctx.sender(),
            name: name,
            description: desc,
            like_history: vector::empty()
        };
        transfer::transfer(user, ctx.sender());
        // users.users = users.users + 1;
    }

    // public fun fetch_User_Account(user_address: address): User{
    //     borrow_global<User>(user_address);
    // }

    // public entry fun create_Question(questions: &mut Questions, duration_ms: u64, user: address,title: String, desc: String, price: u64, payment: &mut Coin<SUI>, clock: &Clock, ctx: &mut TxContext){
    public entry fun create_Question(duration_ms: u64, user: address,title: String, desc: String, price: u64, payment: &mut Coin<SUI>, clock: &Clock, ctx: &mut TxContext){

        assert!(price >= 0, 0);
        assert!(payment.value() >= price, 0);
        let current_time = clock::timestamp_ms(clock);
        let expiration_time = current_time + duration_ms;
        let mut qToEarn = QuestionToEarn {
            id: object::new(ctx),
            price: price,
            balance: balance::zero()
        };
        // we take the mutable reference to the coin and unwrap it to give balance.
        let coin_balance = coin::balance_mut(payment);
        let paid = balance::split(coin_balance, price);

        // as question is posted some amount of token should be added to the balance thus the qToEarn is needed to be mutable reference.
        balance::join(&mut qToEarn.balance, paid);
        let question = Question {
            id: object::new(ctx),
            title: title,
            description: desc,
            user: user,
            price: price,
            question_to_earn: qToEarn,
            expiring_date: expiration_time,
            answers: vector::empty()
        };
        //dof::add(&mut question.id, b"questionToEarn", qToEarn);
        transfer::transfer(question, ctx.sender());
        // questions.questions = questions.questions + 1;
    }

    // entry function is required when there is an entry point to the module.
    // in this case, we are creating an answer to a question.
    // public entry fun create_Answer(answers: &mut Answers, user: address, questionAddress: address, answer: String, ctx: &mut TxContext){
        // we need to store the question address as it might take up a lot of space.
    public entry fun create_Answer(question: &mut Question, user: address, questionAddress: address, answer: String, ctx: &mut TxContext){

        let answer = Answer {
            id: object::new(ctx),
            question_address: questionAddress,
            answer: answer,
            user: user,
            likes: 0
        };
        
        vector::append(&mut question.answers, vector::singleton(object::uid_to_address(&answer.id)));
        transfer::transfer(answer, user);
        
        // question_address = object::id_address(&answer);
        // answers.answers = answers.answers + 1;
    }


    //public entry fun withdraw_question_to_earn(user: address, question: Question, ctx: &mut TxContext){
    public entry fun withdraw_question_to_earn(user: address, questionToWithdraw: &mut Question, clock: &Clock, ctx: &mut TxContext){
        // the program should only be called by the user who posted the question.
        assert!(questionToWithdraw.user == user, 0);

        let current_time = clock::timestamp_ms(clock);

        // check if the question is expired.
        // if its not expired, then the program will recognise that the user is deliberately trying to withdraw the question before the expiry date.
        let qToEarn = &mut questionToWithdraw.question_to_earn;
        // continue with the withdraw function.
        // the procedure is also carried out when the AI agent responded better than human user
        if(current_time <= questionToWithdraw.expiring_date && qToEarn.price >= 0){
            let withdrawn = balance::split(&mut qToEarn.balance, questionToWithdraw.price);
            let coin = coin::from_balance(withdrawn, ctx);
            // we need to borrow the questionToEarn as it is a mutable reference. and we need to say the object in which we will get the mutable reference.
            transfer::public_transfer(coin, ctx.sender());
            qToEarn.price = 0;
            // if it is transfer::transfer the code will not be compiled as the the transfer function needs to be public 
        }
        // else{
        //     // if the question is not expired, the program will distribute the question evenly to the users whose answer go most likes.
        //     let mut answers = questionToWithdraw.answers;
        //     let answer_address: &address = vector::borrow(&answers, 0);
        //     let user: Answer = borrow::new(answer_address);
        // }
        
    }

    // public fun delete_question_to_earn(question: &mut Question){
    //     // Check if the dynamic field "questionToEarn" exists
    //     if (dof::exists_(&question.id, b"questionToEarn")) {
    //         // Remove the dynamic field and obtain its value
    //         let qToEarn: QuestionToEarn = dof::remove(&mut question.id, b"questionToEarn");
    //         // Delete the object associated with the removed field
    //         // object::delete(qToEarn.id);
    //         let QuestionToEarn { id: qToEarnId, .. } = qToEarn;
    //         object::delete(qToEarnId);
    //     }
    // }

 

    // public entry fun remove_dofchild(parent: &mut Question, child: QuestionToEarn){
    //     dof::remove(&mut parent_id, b"questionToEarn");
    // }

    public entry fun add_question_to_earn(parent: &mut Question, child: QuestionToEarn){
        dof::add(&mut parent.id, b"questionToEarn", child);
    }

    public entry fun send_likes_to_answer(answer: &mut Answer){
        answer.likes = answer.likes + 1;
    }

    public entry fun undo_likes_to_answer(answer: &mut Answer){
        answer.likes = answer.likes - 1;
    }   

    public entry fun check_question_expiry(question: &mut Question): bool{
        if(dof::exists_(&question.id, b"questionToEarn")){
            return true
        };
        return false
    }
    // public entry fun update_question(question: &mut Question, ctx){
    //     ques
    // }

    // #[test]
    // fun test_series_of_transactions(){
    //     use sui::test_scenario;
    //     use std::string;
    //     use sui::clock::{Self, Clock};
    //     let test_user = @0xA;
    //     let mut scenario = test_scenario::begin(test_user);
    //     // let scenario = &mut scenario_val;
    //     {
    //         init(scenario.ctx());
    //     };

    //     let test_user_for_Question_Test = User {
    //         id: object::new(scenario.ctx()),
    //         name: string::utf8(b"beta_test_user"),
    //         description: string::utf8(b"beta_test_description"),
    //         address: test_user,
    //         like_history: vector::empty(),
    //     };
    //     let duration_ms = 1000000000000000000;
    //     let title = string::utf8(b"test_title");
    //     let desc = string::utf8(b"test_description");
    //     let price = 1;
    //     let payment = &mut coin::from_balance(balance::zero(), scenario.ctx());
    //     let mut context = tx_context::dummy();
    //     let mut clock = clock::create_for_testing(&mut context);
    //     test_scenario::next_tx(&mut scenario, test_user);
    //     {
    //         let mut users = test_scenario::take_shared<Users>(&scenario);
    //         assert!(users.users == 0, 0);
    //         create_User_Account(&mut users, string::utf8(b"test_user"), string::utf8(b"test_description"), scenario.ctx());
    //         assert!(users.users == 1, 0);
    //         test_scenario::return_shared<Users>(users);
    //     };
    //     test_scenario::next_tx(&mut scenario, test_user);
    //     //let ctx = scenario.ctx();
    //     {
    //         let mut questions = test_scenario::take_shared<Questions>(&scenario);
    //         assert!(questions.questions == 0, 0);
    //         create_Question(&mut questions, duration_ms, object::id_address(&test_user_for_Question_Test), title, desc, price, payment, &clock, scenario.ctx());
    //         assert!(questions.questions == 1, 0);
    //         test_scenario::return_shared<Questions>(questions);
    //     };
    //     scenario.end()
    // }

    
}



        // // test 1: see whether the init function is working.
        // fun test_init() {
        //     let mut ctx = tx_context::dummy()
        //     let test_user = @0xA;
        //     let scenario_val = &mut test_scenario::begin(test_user);
        //     {
        //         suickoverflow::init(test_scenario::ctx(scenario_val));
        //     }
        // }
        

        // fun test_create_User_Account() {
        //     let test_user = @0xA;
        //     let immutable_scenario = test_scenario::begin(test_user);
        //     let scenario = &mut test_scenario::begin(test_user);
            
        //     test_scenario::next_tx(scenario, test_user);
        //     {
        //         // let ctx = test_scenario::ctx(scenario);
        //         let user = test_scenario::take_shared<0x0::suickoverflow::User>(scenario);
        //         suickoverflow::initialise_User_Account(
        //             string::utf8(b"test_user"),
        //             string::utf8(b"test_description"),
        //             test_scenario::ctx(scenario)
        //         );
        //         // we will test whether the user own the object or not.
        //         assert!(test_scenario::has_most_recent_for_sender<suickoverflow::User>(scenario), 0);
        //         test_scenario::return_shared<0x0::suickoverflow::User>(user);
        //     };
        //     test_scenario::end(immutable_scenario);
            
            
            
        // }
    




// search sui transaction website
// search sui transaction website