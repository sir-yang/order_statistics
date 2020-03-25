<template>
	<el-container>
		<el-main>
			<div class="flex_start mb10">
				<el-input placeholder="请输入搜索关键字" clearable v-model="tableSet.keywords" class="search-ipt">
					<el-button slot="append" icon="el-icon-search" @click="search"></el-button>
				</el-input>
				<el-button type="warning" @click="showAll" class="ml10">显示全部</el-button>
				<el-button type="primary" @click="showDialog">添加商品</el-button>
			</div>
			<el-table :data="tableData" v-loading="tableSet.loading" stripe style="width: 100%">
				<el-table-column prop="name" label="商品名称">
				</el-table-column>
				<el-table-column prop="createdAt" label="创建时间">
				</el-table-column>
				<el-table-column label="状态">
					<template slot-scope="scope">
						<el-switch v-model="scope.row.status" :disabled="scope.row.loading" active-color="#13ce66" inactive-color="#ff4949"
						 :active-value="1" :inactive-value="0" @change="handleChange(scope.$index, scope.row)">
						</el-switch>
					</template>
				</el-table-column>
				<el-table-column label="操作">
					<template slot-scope="scope">
						<el-button size="mini" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
						<el-button type="primary" size="mini" @click="handleSpec(scope.$index, scope.row)">规格管理</el-button>
						<el-popconfirm title="确定删除这条数据吗？" @onConfirm="handleDelete(scope.$index, scope.row)">
							<el-button size="mini" type="danger" slot="reference">删除</el-button>
						</el-popconfirm>
					</template>
				</el-table-column>
			</el-table>
			<div class="flex_center mt20">
				<el-pagination background :hide-on-single-page="tableSet.pageSize > tableSet.count" @current-change="handleCurrentChange"
				 :current-page="tableSet.currentPage" :page-size="tableSet.pageSize" layout="total, prev, pager, next, jumper"
				 :total="tableSet.count">
				</el-pagination>
			</div>
			<el-dialog title="添加/编辑商品" :visible.sync="dialogVisible" width="30%" :close-on-click-modal="false" :show-close="false">
				<el-form ref="form" :model="form" :rules="rules" label-width="80px">
					<el-form-item label="商品名称" prop="name">
						<el-input v-model="form.name" :maxlength="30" placeholder="请输入商品名称"></el-input>
					</el-form-item>
				</el-form>
				<span slot="footer" class="dialog-footer">
					<el-button @click="resetForm('form')">取 消</el-button>
					<el-button type="primary" @click="submitForm('form')">确 定</el-button>
				</span>
			</el-dialog>

			<el-dialog :title="'商品规格管理('+goodsName+')'" :visible.sync="dialogSpec" width="30%" :close-on-click-modal="false">
				<el-button size="medium" type="primary" class="mb10" @click="dialogEditSpec=true">添加规格</el-button>
				<el-table :data="specData" v-loading="specLoading" style="width: 100%">
					<el-table-column prop="specName" label="规格名称" width="180">
					</el-table-column>
					<el-table-column label="状态" width="180">
						<template slot-scope="scope">
							<el-switch v-model="scope.row.status" :disabled="scope.row.loading" active-color="#13ce66" inactive-color="#ff4949"
							 :active-value="1" :inactive-value="0" @change="changeSpec(scope.$index, scope.row)">
							</el-switch>
						</template>
					</el-table-column>
					<el-table-column label="操作">
						<template slot-scope="scope">
							<el-button size="mini" @click="editSpec(scope.$index, scope.row)">编辑</el-button>
							<el-popconfirm title="确定删除这条数据吗？" @onConfirm="deleteSpec(scope.$index, scope.row)">
								<el-button size="mini" type="danger" slot="reference">删除</el-button>
							</el-popconfirm>
						</template>
					</el-table-column>
				</el-table>
			</el-dialog>
			
			<el-dialog title="添加/编辑规格" :visible.sync="dialogEditSpec" width="30%" :close-on-click-modal="false" :show-close="false">
				<el-form ref="spec" label-width="80px">
					<el-form-item label="规格名称">
						<el-input v-model="specName" :maxlength="10" placeholder="请输入规格名称"></el-input>
					</el-form-item>
				</el-form>
				<span slot="footer" class="dialog-footer">
					<el-button @click="closeEditSpec">取 消</el-button>
					<el-button type="primary" @click="submitSpec" :loading="submitSpecLoading">确 定</el-button>
				</span>
			</el-dialog>
		</el-main>
	</el-container>

</template>

<script>
	import {
		getList,
		saveCg,
		delCg,
		changeCg
	} from '@/api/goods';
	import { getList as specList, saveCg as specSave, delCg as specDel, changeCg as specChange } from '@/api/spec';
	export default {
		name: 'GoodsList',
		data() {
			return {
				tableSet: {
					loading: false,
					pageSize: 10,
					count: 100,
					currentPage: 1,
					keywords: ''
				},
				tableData: [],
				index: '',
				dialogVisible: false,
				form: {
					name: ''
				},
				rules: {
					name: [{
						required: true,
						message: '商家名称不能为空',
						trigger: 'blur'
					}]
				},
				dialogSpec: false,
				specLoading: false,
				specData: [],
				goodsName: '',
				goodsId: 0,
				dialogEditSpec: false,
				specName: '',
				submitSpecLoading: false,
				specType: 'add',
				specRow: {}
			}
		},
		created() {
			this.getData()
		},
		methods: {
			// 获取列表数据
			getData() {
				let self = this,
					set = this.tableSet;
				let data = {
					page: set.currentPage,
					limit: set.pageSize,
					keywords: set.keywords
				}
				set.loading = true;
				getList(data).then(res => {
					set.loading = false;
					if (res.result.list.length > 0) {
						res.result.list.forEach(item => {
							item["loading"] = false;
						})
					}
					self.tableData = res.result.list;
					set.count = res.result.count;
				})
			},

			// 搜索
			search() {
				this.tableSet.currentPage = 1;
				this.getData();
			},
			// 显示全部
			showAll() {
				this.tableSet.keywords = "";
				this.search();
			},

			// 分页
			handleCurrentChange(page) {
				this.tableSet.currentPage = page;
				this.getData();
			},

			// 更改状态
			handleChange(index, row) {
				let self = this;
				let data = {
					id: row.id,
					ChangeField: 'status',
					ChangeValue: String(row.status)
				}
				row.loading = true;
				changeCg(data).then(res => {
					row.loading = false;
					self.$message({
						message: '操作成功',
						type: 'success',
						center: true
					});
				})
			},

			// 编辑
			handleEdit(index, row) {
				this.index = index;
				this.form = Object.assign({}, row);
				this.dialogVisible = true;
			},
			// 删除
			handleDelete(index, row) {
				let self = this;
				delCg({
					id: row.id
				}).then(res => {
					self.$message({
						message: '删除成功',
						type: 'success',
						center: true
					});
					self.tableData.splice(index, 1);
					self.tableSet.count--;
				})
			},
			
			// 商品规格管理
			handleSpec(index, row) {
				this.dialogSpec = true;
				this.goodsName = row.name;
				this.goodsId = row.id;
				this.getSpecList(row.id);
			},
			// 获取规格数据
			getSpecList(id) {
				let self = this;
				self.specLoading = true;
				specList({
					type_id: id
				}).then(res => {
					self.specLoading = false;
					if (res.result.length > 0) {
						res.result.forEach(item => {
							item["loading"] = false;
						})
					}
					self.specData = res.result;
				})
			},
			
			// 编辑规格
			editSpec(index, row) {
				this.dialogEditSpec = true;
				this.specName = row.specName;
				this.specType = 'edit';
				this.specRow = row;
			},
			// 删除规格
			deleteSpec(index, row) {
				let self = this;
				specDel({
					id: row.id
				}).then(res => {
					self.$message({
						message: '删除成功',
						type: 'success',
						center: true
					});
					self.specData.splice(index, 1);
				})
			},
			// 更改规格状态
			changeSpec(index, row) {
				let self = this;
				let data = {
					id: row.id,
					ChangeField: 'status',
					ChangeValue: String(row.status)
				}
				row.loading = true;
				specChange(data).then(res => {
					row.loading = false;
					self.$message({
						message: '操作成功',
						type: 'success',
						center: true
					});
				})
			},
			
			// 关闭规格编辑弹框
			closeEditSpec() {
				this.specName = "";
				this.dialogEditSpec = false;
				this.specType = 'add';
			},
			
			// 保存规格
			submitSpec() {
				if (this.specName == "") {
					this.$message.warning({
						message: '规格名称不能为空',
						center: true
					});
					return false;
				}
				let self = this;
				self.submitSpecLoading = true;
				let data = {
					specName: self.specName,
					type_id: self.goodsId
				}
				if (self.specType == 'edit') {
					data.id = self.specRow.id;
				}
				specSave(data).then(res => {
					self.submitSpecLoading = false;
					self.$message.success({
						message: '操作成功',
						center: true
					});
					self.closeEditSpec();
					self.getSpecList(self.goodsId);
				})
			},
			
			

			// 显示添加弹框
			showDialog() {
				this.form = {
					companyName: "",
					passwd: '',
					phone: ""
				}
				this.dialogVisible = true;
			},
			// 重置表单信息
			resetForm(formName) {
				this.dialogVisible = false;
				this.$refs[formName].resetFields();
			},
			// 提交表单
			submitForm(formName) {
				this.$refs[formName].validate((valid) => {
					if (valid) {
						this.saveForm(formName);
					} else {
						console.log('验证失败');
						return false;
					}
				});
			},
			saveForm(formName) {
				let self = this;
				let data = {
					name: this.form.name
				}
				if (this.form.hasOwnProperty('id')) {
					data.id = this.form.id;
				}
				saveCg(data).then(res => {
					self.dialogVisible = false;
					self.$message({
						message: '信息提交成功',
						type: 'success',
						center: true
					});
					// 重置
					self.$refs[formName].resetFields();
					if (data.hasOwnProperty('id')) {
						self.getData();
					} else {
						self.showAll();
					}
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.search-ipt {
		width: 300px;
	}
</style>
