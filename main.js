Vue.component('bar', {
    template: '#bar-template',
    data() {
        return {
            edit: false,
            verify: false,
            numberFloat: '+1',
            numberFloatHidden: true,
            tooSmallBlue: false,
            tooSmallRed: false,
            tooSmallGreen: false,
            tooSmallGray: false,

            newIndex: 0,
            newName: '',
            newStartDate: '',
            newEndDate: '',
            newNumberOfActions: 1,
            newActionsCompleted: 0,
            newIncrementUp: 1,
            newIncrementDown: 1
        }
    },
    props: {
        index: Number,
        name: String,
        startDate: String,
        endDate: String,
        numberOfActions: Number,
        actionsCompleted: Number,
        incrementUp: Number,
        incrementDown: Number
    },
    mounted() {
        this.updateTooSmallValues()

        this.newIndex = this.index
        this.newName = this.name
        this.newStartDate = this.startDate
        this.newEndDate = this.endDate
        this.newNumberOfActions = this.numberOfActions
        this.newActionsCompleted = this.actionsCompleted
        this.newIncrementUp = this.incrementUp
        this.newIncrementDown = this.incrementDown
    },
    computed: {
        dateDiff() {
            var startYMD = new Date(this.startDate + 'Z')
            var endYMD = new Date(this.endDate + 'Z')

            var diff = (endYMD - startYMD) / (1000 * 60 * 60 * 24)
            return isNaN(diff) || diff < 0 ? 0 : diff
        },

        actionsAheadBehind() {
            var avg = (this.averageNum / 100) * this.numberOfActions
            return Math.ceil(Math.abs(this.actionsCompleted - avg))
        },
        behind() {
            var avg = (this.averageNum / 100) * this.numberOfActions
            return avg > this.actionsCompleted
        },

        actionsPerDay() {
            var avg = (this.numberOfActions / this.dateDiff).toFixed(2)
            return isNaN(avg) || avg === 'Infinity' || avg === '-Infinity' ? 0 : avg
        },

        daysPerAction() {
            avg = this.actionsPerDay
            return avg == 0 ? 0 : (1 / avg).toFixed(2)
        },

        overlapNum() {
            var overlap = Math.min(this.averageNum, this.currentNum)
            return overlap
        },
        overlapPercent() {
            return this.overlapNum + '%'
        },

        averageNum() {
            var today = new Date();
            var startTodayDiff = Math.ceil((today - new Date(this.startDate + 'Z')) / (1000 * 60 * 60 * 24))
            var startEndDiff = Math.ceil(this.dateDiff)

            var avgNum = Math.round((startTodayDiff / startEndDiff) * 100)
            return isNaN(avgNum) || avgNum < 0 ? 0 : avgNum > 100 ? 100 : avgNum
        },
        averagePercent() {
            return (this.averageNum - this.overlapNum) + '%'
        },

        currentNum() {
            var curNum = Math.round((this.actionsCompleted / this.numberOfActions) * 100)
            return isNaN(curNum) || curNum < 0 ? 0 : curNum > 100 ? 100 : curNum
        },
        currentPercent() {
            return (this.currentNum - this.overlapNum) + '%'
        },

        leftPercent() {
            var left = 100 - Math.max(this.averageNum, this.currentNum)
            return left + '%'
        }
    },
    methods: {
        incrementActionsCompleted(add) {
            if (add) {
                this.newActionsCompleted = Number(this.actionsCompleted) + Number(this.incrementUp)
                this.numberFloat = '+' + this.incrementUp
            }
            else {
                if (this.actionsCompleted < 1)
                    return
                this.newActionsCompleted = Number(this.actionsCompleted) - Number(this.incrementDown)
                if (this.newActionsCompleted < 0)
                    this.newActionsCompleted = 0
                this.numberFloat = '-' + this.newIncrementDown
            }
            this.update()
            this.numberFloatHidden = false
            setTimeout(() => this.numberFloatHidden = true, 100)
        },

        toggleEdit() {
            this.edit = !this.edit
            this.verify = false
            this.newIndex = this.index
            this.newName = this.name
            this.newStartDate = this.startDate
            this.newEndDate = this.endDate
            this.newNumberOfActions = this.numberOfActions
            this.newActionsCompleted = this.actionsCompleted
            this.newIncrementUp = this.incrementUp
            this.newIncrementDown = this.incrementDown
        },
        setEdit(edit){
            this.edit = edit
            this.verify = false
        },
        toggleVerify() {
            this.verify = !this.verify
        },
        remove() {
            this.setEdit(false)
            this.$emit("remove-bar", this.index)
        },
        update() {
            this.setEdit(false)
            this.$emit(
                "update-bar", 
                this.index, 
                this.newIndex, 
                this.newName, 
                this.newStartDate, 
                this.newEndDate, 
                this.newNumberOfActions, 
                this.newActionsCompleted, 
                this.newIncrementUp, 
                this.newIncrementDown
            )
            this.updateTooSmallValues()
        },
        updateTooSmallValues() {
            if (this.$refs.blue !== undefined)
                this.tooSmallBlue = this.$refs.blue.clientWidth < 30
            else
                this.tooSmallBlue = true
            if (this.$refs.red !== undefined)
                this.tooSmallRed = this.$refs.red.clientWidth < 30
            else this.tooSmallRed = true
            if (this.$refs.green !== undefined)
                this.tooSmallGreen = this.$refs.green.clientWidth < 30
            else
                this.tooSmallGreen = true
            if (this.$refs.gray !== undefined)
                this.tooSmallGray = this.$refs.gray.clientWidth < 30
            else
                this.tooSmallGray = true
        }
    }
})

var app = new Vue({
    el: '#app',
    data: {
        bars: [],
        darkMode: false
    },
    methods: {
        addNewBar() {
            //add new bar with index 0
            this.bars.unshift({
                name: '',
                startDate: '',
                endDate: '',
                numberOfActions: 1,
                actionsCompleted: 0,
                incrementUp: 1,
                incrementDown: 1
            })

        },
        toggleDarkMode(){
            this.darkMode = !this.darkMode
            this.setDarkMode()
        },
        setDarkMode(){
            document.getElementsByTagName("BODY")[0].classList.toggle("dark", this.darkMode)
        },
        removeBar(index) {
            this.bars.splice(index, 1)
        },
        updateBar(index, newIndex, newName, newStartDate, newEndDate, newNumberOfActions, newActionsCompleted, newIncrementUp, newIncrementDown) {
            //update values
            this.bars[index].name = newName
            this.bars[index].startDate = newStartDate
            this.bars[index].endDate = newEndDate
            this.bars[index].numberOfActions = Number(newNumberOfActions)
            this.bars[index].actionsCompleted = Number(newActionsCompleted)
            this.bars[index].incrementUp = Number(newIncrementUp)
            this.bars[index].incrementDown = Number(newIncrementDown)

            //move bar to new location
            var bar = this.bars[index]
            this.bars.splice(index, 1)
            this.bars.splice(newIndex, 0, bar)
        }
    },
    mounted() {
        if (localStorage.bars) {
            this.bars = JSON.parse(localStorage.bars)
            if (localStorage.darkMode !== 'undefined')
                this.darkMode = (localStorage.darkMode == "true")

            for (let index = 0; index < this.bars.length; index++) {
                const element = this.bars[index];
                if (element.incrementUp === undefined)
                    element.incrementUp = 1
                if (element.incrementDown === undefined)
                    element.incrementDown = 1
            }
        }
        this.setDarkMode()
    },
    watch: {
        bars(newBars) {
            localStorage.bars = JSON.stringify(newBars)
        },
        darkMode(newDarkMode) {
            localStorage.darkMode = newDarkMode
        }
    }
})
