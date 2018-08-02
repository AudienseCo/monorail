BRANCH_NAME=$1

cd repository
npm version minor
cd nebula
npm version minor
git push origin $BRANCH_NAME
git push origin --tags
