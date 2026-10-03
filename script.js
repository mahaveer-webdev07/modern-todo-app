let inp = document.getElementById('inp-todo')
let task = document.getElementById("taskList")
let bar = document.getElementById("bar")
let subtitle = document.getElementById("subtitle")
let empty = document.getElementById("empty")
let pill = document.getElementById("pill")
let tabs = document.querySelectorAll(".filters button")

let todos = JSON.parse(localStorage.getItem("todos")) || []
let filter = "all"
let newId = null

// purane todos mein id nahi thi, wo yahan add ho jati hai
todos.forEach((t, i) => { if (!t.id) t.id = Date.now() + i })

function save() {
    localStorage.setItem("todos", JSON.stringify(todos))
}

function Add() {
    let assignment = inp.value.trim()

    if (assignment === "") {
        inp.classList.remove("shake")
        void inp.offsetWidth          // animation dobara chalane ke liye
        inp.classList.add("shake")
        inp.focus()
        return                        // khali todo add nahi hoga
    }

    newId = Date.now()
    todos.unshift({ id: newId, text: assignment, done: false, date: new Date() })
    save()

    inp.value = ""
    if (filter === "done") setFilter("all")
    else show()
}

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'
const CROSS = '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>'

function show() {
    task.innerHTML = ""

    let list = todos.filter(t =>
        filter === "all" ? true : filter === "done" ? t.done : !t.done)

    list.forEach(t => {
        let li = document.createElement("li")
        li.dataset.id = t.id
        if (t.done) li.classList.add("done")
        if (t.id === newId) li.classList.add("enter")

        let label = document.createElement("label")
        label.className = "check"
        label.innerHTML = `<input type="checkbox" ${t.done ? "checked" : ""}><div class="box">${CHECK}</div>`
        label.firstChild.addEventListener("change", () => taskdone(t.id))

        let span = document.createElement("span")
        span.textContent = t.text      // textContent => safe, HTML inject nahi hoga

        let btn = document.createElement("button")
        btn.className = "btn-delete"
        btn.innerHTML = CROSS
        btn.setAttribute("aria-label", "Delete")
        btn.addEventListener("click", () => del(t.id))

        li.append(label, span, btn)
        task.appendChild(li)
    })
    newId = null

    empty.classList.toggle("show", list.length === 0)
    empty.querySelector("p").textContent =
        todos.length === 0 ? "Nothing here yet" : filter === "done" ? "Nothing completed yet" : "All clear!"
    updateProgress()
}

function updateProgress() {
    let total = todos.length
    let done = todos.filter(t => t.done).length
    bar.style.width = total ? (done / total * 100) + "%" : "0%"
    subtitle.textContent = total === 0
        ? "Let's get things done"
        : done === total ? "🎉 All done, great job!"
        : `${done} of ${total} completed`
}

function taskdone(id) {
    let t = todos.find(x => x.id === id)
    t.done = !t.done
    save()
    // list rebuild kiye baghair animation smooth rakhne ke liye sirf class badlo
    let li = task.querySelector(`li[data-id="${id}"]`)
    li.classList.toggle("done", t.done)
    updateProgress()
    if (filter !== "all") setTimeout(() => del_visual(id), 450)
}

function del_visual(id) {
    let li = task.querySelector(`li[data-id="${id}"]`)
    if (!li) return
    li.classList.add("leaving")
    li.addEventListener("animationend", () => { li.remove(); show() }, { once: true })
}

function del(id) {
    let li = task.querySelector(`li[data-id="${id}"]`)
    todos = todos.filter(t => t.id !== id)
    save()
    if (!li) return show()
    li.classList.add("leaving")
    li.addEventListener("animationend", show, { once: true })
}

function setFilter(f) {
    filter = f
    tabs.forEach(b => b.classList.toggle("active", b.dataset.f === f))
    movePill()
    show()
}

function movePill() {
    let active = document.querySelector(".filters button.active")
    pill.style.width = active.offsetWidth + "px"
    pill.style.transform = `translateX(${active.offsetLeft - 4}px)`
}

tabs.forEach(b => b.addEventListener("click", () => setFilter(b.dataset.f)))
inp.addEventListener("keydown", e => { if (e.key === "Enter") Add() })
window.addEventListener("resize", movePill)

show()
requestAnimationFrame(movePill)
