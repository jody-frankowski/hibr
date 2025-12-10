.PHONY: build

build:
	go build

docker-build:
	docker build . -t hibr

run:
	ROCKYOU_URL=https://github.com/brannondorsey/naive-hashcat/releases/download/data/rockyou.txt go run .

docker-run:
	docker run -p 8080:8080 hibr
