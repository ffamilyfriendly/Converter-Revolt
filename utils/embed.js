class Embed {
    constructor() {
        this.fields = [ ]
        this.title = "Embed"
        this.description = ""
        this.footer = ""
    }

    addField(title, content) {
        this.fields.push(`## ${title}\n${content}`)
    }

    setFooter(content) {
        this.footer = content
    }

    toText() {
        return `# ${this.title}\n ${this.description}\n${this.fields.join("\n")} \n\n\n\$\\small{\\text{${this.footer}}}$\n`
    }
}

module.exports = Embed