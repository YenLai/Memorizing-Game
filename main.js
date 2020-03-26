const Symbols = [
    'https://image.flaticon.com/icons/svg/105/105223.svg', // 黑桃
    'https://image.flaticon.com/icons/svg/105/105220.svg', // 愛心
    'https://image.flaticon.com/icons/svg/105/105212.svg', // 方塊
    'https://image.flaticon.com/icons/svg/105/105219.svg'  // 梅花
]

const GAME_STATE = {
    FirstCardAwaits: 'FirstCardAwaits',
    SecondCardAwaits: 'SecondCardAwaits',
    CardsMatchFailed: 'CardsMatchFailed' ,
    CardMatched : 'CardMatched',
    GameFinished: 'GameFinished'

}

const utility = {
    getRandomNumberArray(count) {
        const number = Array.from(Array(count).keys())
        for(let index = number.length-1;index > 0; index--){  //index取0-51
            let randomIndex = Math.floor(Math.random() * (index + 1))  //取0-51
            ;[number[index],number[randomIndex]] = [number[randomIndex], number[index]]
        }
        return number
    },
}

const view = {
    getCardElement(index) {
        return `<div data-index="${index}" class="card back"></div>`
    },
    getCardContent(index) {
        const number = this.transformNumber((index % 13) +1)
        const symbol = Symbols[Math.floor(index / 13)]
        return `
        <p>${number}</p>
        <img src="${symbol}" alt="">
        <p>${number}</p>`
    },
    displayCards(indexes){
        const rootElement = document.getElementById('cards')
        rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join('')

    },
    transformNumber (number){
        switch (number) {
            case 1:
                return 'A'
            case 11: 
                return 'J'
            case 12:
                return 'Q'
            case 13:
                return 'K'
            default:
                return number
        }
    },
    flipCards(...cards) {  //傳入參數是值(可以是多個值(1,2,3)，也可以是單個值(1))，傳入之後會被...轉成array
        cards.map(card => {
            let cardNum = Number(card.dataset.index)
            if(card.classList.contains('back')){
                //回傳正面
                card.classList.remove('back')
                card.innerHTML = this.getCardContent(cardNum)
                return
            }   
            //回傳背面
            card.classList.add('back')
            card.innerHTML = null
        })
    },
    pairCards(...cards){
        cards.map(card => {
            card.classList.add("paired")
        })
    },
    renderScore(score) {
        document.querySelector('.score').innerHTML = `Score: ${score}`
    },
    renderTriedTimes(times) {
        document.querySelector('.tried').innerHTML = `You've tried ${times} times`
    },
    appendWrongAnimation(...cards) {
        cards.map (card => {
            card.classList.add('wrong')
            card.addEventListener('animationend', event => 
            event.target.classList.remove('wrong'),{once: true})
        })
    },
    showGameFinished(){
        const div = document.createElement('div')
        div.classList.add('completed')
        div.innerHTML = `
        <p>Complete!</p>
        <p>Score: ${model.score}</p>
        <p>You've tried: ${model.triedTimes} times</p>
        `
        const header = document.querySelector('#header')
        header.before(div)
    }
    
}

const controller = {
    currentState: GAME_STATE.FirstCardAwaits,
    
    generateCards(){  //讓controller去call洗牌的function
        view.displayCards(utility.getRandomNumberArray(52))
    }
    ,
    dispatchCardAction(card){
        if (!card.classList.contains('back'))
            return
        switch (this.currentState){
            case GAME_STATE.FirstCardAwaits:
                view.flipCards(card)
                model.revealedCards.push(card)
                this.currentState = GAME_STATE.SecondCardAwaits
                view.renderTriedTimes(model.triedTimes++)
                break

            case GAME_STATE.SecondCardAwaits:
                view.flipCards(card)
                model.revealedCards.push(card)
                //判斷配對是否成功
                if(model.isRevealedCardsMatched()){
                    this.currentState = GAME_STATE.CardMatched
                    view.renderScore(model.score+=10)
                    view.pairCards(...model.revealedCards)
                    model.revealedCards = []
                    if (model.score === 260){
                        console.log('showGameFinished')
                        this.currentState = GAME_STATE.GameFinished
                        view.showGameFinished()
                        return
                    }
                    this.currentState = GAME_STATE.FirstCardAwaits
                }else{
                    this.currentState = GAME_STATE.CardsMatchFailed
                    view.appendWrongAnimation(...model.revealedCards)
                    setTimeout(this.resetCards,1000)
                break
                }
        }
                
    }
    ,
    resetCards(){
        view.flipCards(...model.revealedCards)
        model.revealedCards = []
        controller.currentState = GAME_STATE.FirstCardAwaits
    }
}

const model = {
    score : 0,
    triedTimes: 0,
    revealedCards: [],
    isRevealedCardsMatched(){
        console.log(this.revealedCards)
        return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
    }
    
}

controller.generateCards()

document.querySelectorAll('.card').forEach( card => {
    card.addEventListener('click', event => {
        controller.dispatchCardAction(card)
    })
})

