Here's the source for the node (client) part.

Because it's a long-running background process, I spawn it off using a 'wrapper' node program, which tells the shell to ignore STDIO.
