#!/usr/bin/env bash
# Require no password for 'sudo' execution
echo "${USER} ALL=(ALL) NOPASSWD: ALL" | sudo EDITOR='tee -a' visudo
# Show line number when using vi(m)
echo 'set nu' > ~/.vimrc
# Create script to swap 'Esc' & 'CapsLock' keys. Makes things easier for people that use vi(m)
echo "#!/usr/bin/env bash" > ~/_swapEsc.sh
echo "setxkbmap -option caps:swapescape" >> ~/_swapEsc.sh
chmod 755 ~/_swapEsc.sh
# Create script to enable 'git' credential caching
echo '#!/usr/bin/env bash' > ~/_cache-git-credentials.sh
echo 'git config --global credential.helper store' >> ~/_cache-git-credentials.sh
chmod 755 ~/_cache-git-credentials.sh
# Set vi(m) as default editor
sudo update-alternatives --set editor /usr/bin/vim.tiny
# bash config
echo 'set -o vi' >> .bashrc
echo "alias h='history'" >> .bashrc
echo "alias d='docker'" >> .bashrc
echo "shopt -s dotglob" >> .bashrc
# Install some aptitude things
sudo apt-get update
# A little Chrome will brighten our day
curl -O https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo apt install -y ./google-chrome-stable_current_amd64.deb
# Get the tedious Docker (ce) install over with [https://docs.docker.com/install/linux/docker-ce/ubuntu/]
sudo apt-get install -y apt-transport-https ca-certificates curl gnupg-agent software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
echo "deb [arch=amd64] https://download.docker.com/linux/ubuntu bionic stable" | sudo tee -a /etc/apt/sources.list.d/docker.list
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io git openssh-server
# Add USER to 'docker' group
sudo usermod -aG docker ${USER}
# Seems like everybody uses docker-compose these days ...
sudo curl -L "https://github.com/docker/compose/releases/download/1.28.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod 755 /usr/local/bin/docker-compose
# NodeJS is the best, also best to use NVM managed user local install
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.37.2/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
nvm install 13
# JetBrains tools rock!!
curl -O https://download-cf.jetbrains.com/webstorm/WebStorm-2020.3.2.tar.gz
# wget https://download-cf.jetbrains.com/python/pycharm-professional-2019.3.4.tar.gz
sudo tar -C /var/local -xvf WebStorm-2020.3.2.tar.gz
# sudo tar -C /var/local -xvf pycharm-professional-2019.3.4.tar.gz
/var/local/WebStorm-203.7148.54/bin/webstorm.sh
# /var/local/pycharm-2019.3.4/bin/pycharm.sh

