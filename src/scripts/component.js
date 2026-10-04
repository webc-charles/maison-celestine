export class KnrComponent {
  static mount(root = document) {
    if (!this.mounted) this.mounted = new WeakSet()

    for (const element of root.querySelectorAll(this.selector)) {
      if (this.mounted.has(element)) continue
      
      // WeakSet ex: { <button>, <button> }
      this.mounted.add(element) 

      // instances ex: [ {button: <button>, count: 0}, {button: <button>, count: 0} ]
      this.instances.push(new this(element))
    }
  }
}
