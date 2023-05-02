
## Installation

```bash
$ pnpm install
```

## Running the app


rename `.env.sample` to `.env`

then start docker-compose

```bash
$ docker-compose up -d
```

if you got this error: `ERROR: failed to solve: error from sender: open /home/dimon/WebstormProjects/devit-group/server/mongo/data/diagnostic.data: permission denied`,
you must execute the command 

```bash
$ sudo chmod -R 777 <your-path>/server/mongo/data
```

then restart command: 

```bash
$ docker-compose up -d
```