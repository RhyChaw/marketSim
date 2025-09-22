# OCaml Replay Core

Deterministic event scheduler with a simple speed governor.

## Build

- Ensure OCaml and dune are installed (e.g., via opam)
- From this directory:

```
dune build
```

## Demo Run

- Print demo events at 10x speed (default):

```
dune exec marketsim_core
```

- Custom speed (e.g., 100x):

```
dune exec marketsim_core -- 100
```

or

```
SPEED=100 dune exec marketsim_core
```
