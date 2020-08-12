Vue.component('milestone', {
    template: '#milestone-template',
    data() {
        return {
            editMilestoneModal: false,
            deleteMilestoneModal: false,
            newName: this.name,
            newActions: this.actions
        }
    },
    props: {
        name: String,
        actions: Number
    },
    computed: {
        percent() {
            let a = this.$parent.goalActions
            let b = this.actions / a
            return b
        },
        percentRounded() {
            return Math.round(this.percent * 100)
        },
        date() {
            let startdate = Date.parse(this.$parent.startDate)
            let enddate = Date.parse(this.$parent.endDate)
            let diff = enddate - startdate
            let date = new Date(startdate + (diff * this.percent))

            return date.toString().substr(4, 11)
        },
        styleObject() {
            return {
                'margin-left': Math.round(this.percentRounded) + '%'
            }
        }
    },
    methods: {
        openEditModal() {
            this.newName = this.name
            this.newActions = this.actions
            this.editMilestoneModal = true
        },
        closeEditModal(event) {
            if (event.target == this.$refs.editMilestoneModal || event.target == this.$refs.closeEditModal)
                this.editMilestoneModal = false
        },
        save() {
            let newMilestone = {
                name: this.newName,
                actions: parseInt(this.newActions)
            }
            this.$emit(
                "update-milestone",
                newMilestone
            )
            this.editMilestoneModal = false
        },
        openDeleteModal() {
            this.deleteMilestoneModal = true
        },
        closeDeleteModal(event) {
            if (event.target == this.$refs.deleteMilestoneModal 
                || event.target == this.$refs.closeDeleteModal
                || event.target == this.$refs.cancelDelete)
                this.deleteMilestoneModal = false
        },
        deleteMilestone() {
            this.$emit(
                "delete-milestone"
            )
            this.editMilestoneModal = false
            this.deleteMilestoneModal = false
        }
    }
})

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
            newMilestoneModal: false,

            newIndex: 0,
            newName: '',
            newStartDate: '',
            newEndDate: '',
            newGoalActions: 1,
            newActionsCompleted: 0,
            newIncrementUp: 1,
            newIncrementDown: 1,

            newMilestoneList: new Array(),
            newMilestoneName: "",
            newMilestoneActions: 0
        }
    },
    props: {
        index: Number,
        name: String,
        startDate: String,
        endDate: String,
        goalActions: Number,
        actionsCompleted: Number,
        incrementUp: Number,
        incrementDown: Number,
        milestoneList: Array
    },
    mounted() {
        this.updateTooSmallValues()

        this.newIndex = this.index
        this.newName = this.name
        this.newStartDate = this.startDate
        this.newEndDate = this.endDate
        this.newGoalActions = this.goalActions
        this.newActionsCompleted = this.actionsCompleted
        this.newIncrementUp = this.incrementUp
        this.newIncrementDown = this.incrementDown
        this.newMilestoneList = this.milestoneList
    },
    computed: {
        dateDiff() {
            let startYMD = new Date(this.startDate + 'Z')
            let endYMD = new Date(this.endDate + 'Z')

            let diff = (endYMD - startYMD) / (1000 * 60 * 60 * 24)
            return isNaN(diff) || diff < 0 ? 0 : diff
        },

        actionsAheadBehind() {
            let avg = (this.averageNum / 100) * this.goalActions
            return Math.ceil(Math.abs(this.actionsCompleted - avg))
        },
        behind() {
            let avg = (this.averageNum / 100) * this.goalActions
            return avg > this.actionsCompleted
        },

        actionsPerDay() {
            let avg = (this.goalActions / this.dateDiff).toFixed(2)
            return isNaN(avg) || avg === 'Infinity' || avg === '-Infinity' ? 0 : avg
        },

        daysPerAction() {
            avg = this.actionsPerDay
            return avg == 0 ? 0 : (1 / avg).toFixed(2)
        },

        overlapNum() {
            let overlap = Math.min(this.averageNum, this.currentNum)
            return overlap
        },
        overlapPercent() {
            return this.overlapNum + '%'
        },

        averageNum() {
            let today = new Date();
            let startTodayDiff = Math.ceil((today - new Date(this.startDate + 'Z')) / (1000 * 60 * 60 * 24))
            let startEndDiff = Math.ceil(this.dateDiff)

            let avgNum = Math.round((startTodayDiff / startEndDiff) * 100)
            return isNaN(avgNum) || avgNum < 0 ? 0 : avgNum > 100 ? 100 : avgNum
        },
        averagePercent() {
            return (this.averageNum - this.overlapNum) + '%'
        },

        currentNum() {
            let curNum = Math.round((this.actionsCompleted / this.goalActions) * 100)
            return isNaN(curNum) || curNum < 0 ? 0 : curNum > 100 ? 100 : curNum
        },
        currentPercent() {
            return (this.currentNum - this.overlapNum) + '%'
        },

        leftPercent() {
            let left = 100 - Math.max(this.averageNum, this.currentNum)
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
            this.newGoalActions = this.goalActions
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
            this.$emit("remove-bar")
        },
        update() {
            this.setEdit(false)
            let newBar = {
                index: this.newIndex, 
                name: this.newName, 
                startDate: this.newStartDate, 
                endDate: this.newEndDate, 
                goalActions: this.newGoalActions, 
                actionsCompleted: this.newActionsCompleted, 
                incrementUp: this.newIncrementUp, 
                incrementDown: this.newIncrementDown,
                milestoneList: this.newMilestoneList
            }
            this.$emit(
                "update-bar", 
                newBar
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
        },
        openMilestoneModal() {
            this.newMilestoneModal = true
        },
        closeMilestoneModal(event) {
            if (event.target == this.$refs.newMilestoneModal || event.target == this.$refs.closeModal)
                this.newMilestoneModal = false
        },
        addMilestone() {
            this.newMilestoneList.push({ 
                name: this.newMilestoneName,
                actions: parseInt(this.newMilestoneActions) 
            })
            this.update()
            this.newMilestoneModal = false
            this.newMilestoneName = ""
            this.newMilestoneActions = 0
        },
        updateMilestone(milestone, newMilestone) {
            milestone.name = newMilestone.name
            milestone.actions = newMilestone.actions
            this.update()
        },
        deleteMilestone(milestone) {
            let index = this.newMilestoneList.indexOf(milestone)
            this.newMilestoneList.splice(index, 1)
            this.update()
        }
    }
})

let app = new Vue({
    el: '#app',
    data: {
        barList: [],
        darkMode: false
    },
    methods: {
        addNewBar() {
            //add new bar with index 0
            this.barList.push({
                name: '',
                startDate: '',
                endDate: '',
                goalActions: 1,
                actionsCompleted: 0,
                incrementUp: 1,
                incrementDown: 1,
                milestoneList: new Array()
            })

            this.saveToLocalStorage()
        },
        toggleDarkMode(){
            this.darkMode = !this.darkMode
            this.setDarkMode()
            localStorage.darkMode = this.darkMode
        },
        setDarkMode(){
            document.getElementsByTagName("BODY")[0].classList.toggle("dark", this.darkMode)
        },
        removeBar(bar) {
            let index = this.barList.indexOf(bar)
            this.barList.splice(index, 1)

            this.saveToLocalStorage()
        },
        updateBar(bar, newBar) {
            let index = this.barList.indexOf(bar)

            //update values
            bar.name = newBar.name
            bar.startDate = newBar.startDate
            bar.endDate = newBar.endDate
            bar.goalActions = Number(newBar.goalActions)
            bar.actionsCompleted = Number(newBar.actionsCompleted)
            bar.incrementUp = Number(newBar.incrementUp)
            bar.incrementDown = Number(newBar.incrementDown)
            bar.milestoneList = newBar.milestoneList

            //move bar to new location
            if (index != newBar.index) {
                this.barList.splice(index, 1)
                this.barList.splice(newBar.index, 0, bar)
            }

            this.saveToLocalStorage()
        },
        saveToLocalStorage() {
            localStorage.barList = JSON.stringify(this.barList)
        }
    },
    mounted() {
        if (localStorage.barList === undefined) {
            this.bars = JSON.parse(localStorage.bars)
            if (localStorage.darkMode !== 'undefined')
                this.darkMode = (localStorage.darkMode == "true")

            for (let index = 0; index < this.bars.length; index++) {
                const element = this.bars[index];
                if (element.incrementUp === undefined)
                    element.incrementUp = 1
                if (element.incrementDown === undefined)
                    element.incrementDown = 1
                
                if (element.goalActions === undefined)
                    element.goalActions = element.numberOfActions

                if (element.milestoneList === undefined){
                    if (element.milestones === undefined)
                        element.milestoneList = new Array()
                    else
                        element.milestoneList = element.milestones
                }
            }

            localStorage.barList = localStorage.bars
        }
        if (localStorage.barList) {
            this.barList = JSON.parse(localStorage.barList)
            this.darkMode = (localStorage.darkMode == "true")
        }
        this.setDarkMode()
    }
})
