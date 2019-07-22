import React, {Component} from 'react';
import Auxi from '../../hoc/Auxi'
import Burger from '../../components/Burger/Burger'
import BuildControls from '../../components/Burger/BuildControls/BuildControls'
import Modal from '../../components/UI/Modal/Modal'
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary'
import axios from '../../axios(orders)'

//Prices for each ingredient
const INGREDIENT_PRICES = {
    salad: 0.5,
    cheese: 0.8,
    bacon: 0.7,
    meat: 1.2
}

class BurgerBuilder extends Component{
    //the amount of each ingredient present in the burger
    state={
        ingredients:{
            salad:0,
            bacon:0,
            cheese:0,
            meat:0
        },
        //initial price of the burger. i.e for just bread-top and bread-bottom 
        totalPrice : 4,
        //sole aim of purchaseable is to enable the ORDER NOW button
        purchasable: false,
        purchasing: false
    }


    //Responsible for altering purchaseable
    updatePurchaseState =(ingredients)=>{
        const sum = Object.keys(ingredients)//converts object into an array of its keys(i.e name of each ingredient) and gives each an index 
            .map(igKey => {//igkey is the name of each ingredient
                
                return ingredients[igKey]
            })
            .reduce((sum, el) => {
                return sum + el;
            }, 0);
        this.setState({purchasable: sum > 0})
    }

    //function that gets called when i want to add an ingredient
    addIngredientHandler = (type) => {
        //this.state.ingredients[type] gives the property value of the property type passed in
        const oldCount= this.state.ingredients[type];
        const updatedCount = oldCount + 1;
        //assgin state before updating to a new constant...just so that i dont alter the previous state(make a copy)
        const updatedIngredients = {
            ...this.state.ingredients
        }
        //assign the new count to the particular ingredient in our new const 
        //alter the new copy
        updatedIngredients[type] = updatedCount;
        //store the price of the ingredient type i want to add into a new constant
        const priceAddition = INGREDIENT_PRICES[type];
        const oldPrice = this.state.totalPrice;
        //add state initial price to price of ingredient i want to add
        const newPrice = oldPrice + priceAddition;
        //use SETSTATE to do the trick of updating the state respectively
        this.setState({totalPrice:newPrice, ingredients:updatedIngredients});
        this.updatePurchaseState(updatedIngredients);
    }

    removeIngredientHandler =(type) => {
        const oldCount= this.state.ingredients[type];
        //if oldCount is 0 or less than calling this function should do nothing
        if(oldCount <= 0){
            return;
        }

        //the logic is the same with add ingredients only that here its subtracted
        const updatedCount = oldCount - 1;
        const updatedIngredients = {
            ...this.state.ingredients
        };
        updatedIngredients[type] = updatedCount;
        const priceDeduction = INGREDIENT_PRICES[type];
        const oldPrice = this.state.totalPrice;
        const newPrice = oldPrice - priceDeduction;
        this.setState({totalPrice:newPrice, ingredients:updatedIngredients});
        this.updatePurchaseState(updatedIngredients);
    }

    //once this is triggered some css property for modal and backdrop would be changed
    purchaseHandler = () => {
        this.setState({purchasing: true});
    }
    //exact opposite of the above function
    purchaseCancelHandler =() => {
        this.setState({purchasing:false})
    }

    purchaseContinueHandler =() => {
        const order ={
            ingredients:this.state.ingredients,
            price:this.state.totalPrice,
            customer : {
                name: 'Obodo David',
                address:{
                    street: 'RCCG camp',
                    zipCode: '12345',
                    country: 'Nigeria'
                },
                email: 'obodo@test.com'    
                },
            deliveryMethod : 'fastest'
        }
        axios.post('/orders.json', order )
            .then(response => console.log(response))
            .catch(error => console.log(error));
    }


    render(){
        //pass all the states into a new constant cause we want to improve the user interface
        //This improvement is such that the button will be disabled when clicking it might become an error(even though we have solved this error)
        const disabledInfo ={
            ...this.state.ingredients
        };

        for(let key in disabledInfo){
        //this would either return true or false
        //the key is the property value of the property name...i.e The number of each ingredient in my state
        //this gets run four times for each of the ingredients
        //if the key(i.e amount of that ingredient) fufills the below condition then it returns true
            disabledInfo[key] = disabledInfo[key] <= 0
        }

        //passed the above mentioned functions and state as props into buildControls
        return(
            <Auxi>
                <Modal show = {this.state.purchasing} modalClosed={this.purchaseCancelHandler}>
                    <OrderSummary 
                        price={this.state.totalPrice}
                        ingredients={this.state.ingredients}
                        purchaseCanceled={this.purchaseCancelHandler}
                        purchaseContinued={this.purchaseContinueHandler}/>
                </Modal>
                <Burger ingredients={this.state.ingredients}/>
                <BuildControls 
                    ingredientAdded={this.addIngredientHandler}
                    ingredientRemoved={this.removeIngredientHandler}
                    disabled={disabledInfo}
                    purchasable={this.state.purchasable}
                    ordered={this.purchaseHandler}
                    price={this.state.totalPrice}/>
            </Auxi>
        )
    }
}

export default BurgerBuilder