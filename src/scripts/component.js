export class KnrComponent {
  static mount(root = document) {
    if (!this.mounted) this.mounted = new WeakSet()

    for (const element of root.querySelectorAll(this.selector)) {
      if (this.mounted.has(element)) continue

      this.mounted.add(element)

      this.instances.push(new this(element))
    }
  }
}
